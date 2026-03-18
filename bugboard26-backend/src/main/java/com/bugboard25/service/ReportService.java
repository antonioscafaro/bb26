package com.bugboard25.service;

import com.bugboard25.dto.*;
import com.bugboard25.entity.*;
import com.bugboard25.entity.enumerations.*;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class ReportService {

    private final IssueRepository issueRepository;
    private final ProgettiRepository progettiRepository;
    private final UtentiRepository utentiRepository;

    public ReportService(IssueRepository issueRepository, ProgettiRepository progettiRepository,
                         UtentiRepository utentiRepository) {
        this.issueRepository = issueRepository;
        this.progettiRepository = progettiRepository;
        this.utentiRepository = utentiRepository;
    }

    /**
     * Genera report mensile.
     * @param idProgetto ID progetto (0 = tutti i progetti)
     * @param mese Mese (1-12)
     * @param anno Anno
     * @param emailUtente Email utente (null = tutti gli utenti)
     */
    public ReportMensileDTO generaReport(int idProgetto, int mese, int anno, String emailUtente) {
        LocalDate start = LocalDate.of(anno, mese, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        Date dataInizio = Date.from(start.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date dataFine = Date.from(end.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());

        Progetti progetto = resolveProgetto(idProgetto);

        ReportDataHolder data = fetchIssueData(progetto, dataInizio, dataFine);
        FilteredReportData filtered = applyUserFilter(data, emailUtente, progetto, idProgetto);

        return buildReport(filtered, progetto, idProgetto);
    }

    private Progetti resolveProgetto(int idProgetto) {
        if (idProgetto != 0) {
            return progettiRepository.findById(idProgetto)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));
        }
        return null;
    }

    private ReportDataHolder fetchIssueData(Progetti progetto, Date dataInizio, Date dataFine) {
        Date dateCriticalLimit = Date.from(LocalDate.now().minusDays(7).atStartOfDay(ZoneId.systemDefault()).toInstant());

        if (progetto != null) {
            return new ReportDataHolder(
                    issueRepository.findByIdProgettoAndDataCreazioneBetween(progetto, dataInizio, dataFine),
                    issueRepository.findByIdProgettoAndStatoIssueAndDataUltimoAggiornamentoBetween(progetto, stato_issue.RISOLTA, dataInizio, dataFine),
                    issueRepository.findCriticalAlertsByProject(progetto, dateCriticalLimit).stream().map(IssueDTO::new).toList(),
                    issueRepository.countCurrentlyOpenByProject(progetto)
            );
        }
        return new ReportDataHolder(
                issueRepository.findByDataCreazioneBetween(dataInizio, dataFine),
                issueRepository.findByStatoIssueAndDataUltimoAggiornamentoBetween(stato_issue.RISOLTA, dataInizio, dataFine),
                issueRepository.findCriticalAlerts(dateCriticalLimit).stream().map(IssueDTO::new).toList(),
                issueRepository.countCurrentlyOpen()
        );
    }

    private FilteredReportData applyUserFilter(ReportDataHolder data, String emailUtente,
                                                Progetti progetto, int idProgetto) {
        Utenti utenteSelezionato = resolveUtente(emailUtente);

        if (utenteSelezionato != null) {
            final Utenti u = utenteSelezionato;

            List<Issue> filteredCreate = data.issueCreate.stream()
                    .filter(i -> u.equals(i.getAutore()) || u.equals(i.getAssegnatario()))
                    .toList();

            List<Issue> filteredRisolte = data.issueRisolte.stream()
                    .filter(i -> u.equals(i.getAssegnatario()))
                    .toList();

            long openCount = (progetto != null)
                    ? issueRepository.countCurrentlyOpenByProjectAndUser(progetto, u)
                    : issueRepository.countCurrentlyOpenByUser(u);

            return new FilteredReportData(filteredCreate, filteredRisolte, data.allerteCritiche,
                    openCount, Collections.singletonList(utenteSelezionato));
        }

        List<Utenti> membri = (progetto != null)
                ? utentiRepository.findMembriByProgettoId(idProgetto)
                : utentiRepository.findAll();

        return new FilteredReportData(data.issueCreate, data.issueRisolte, data.allerteCritiche,
                data.totaleIssueAperte, membri);
    }

    private Utenti resolveUtente(String emailUtente) {
        if (emailUtente != null && !emailUtente.isEmpty() && !emailUtente.equals("all")) {
            return utentiRepository.findById(emailUtente).orElse(null);
        }
        return null;
    }

    private ReportMensileDTO buildReport(FilteredReportData data, Progetti progetto, int idProgetto) {
        ReportMensileDTO report = new ReportMensileDTO();
        report.setTotaleIssueCreate(data.issueCreate.size());
        report.setTotaleIssueRisolte(data.issueRisolte.size());
        report.setTotaleIssueAperte(data.totaleIssueAperte);
        report.setTempoMedioRisoluzioneGlobale(calcolaTempoMedioRisoluzione(data.issueRisolte));
        report.setDistribuzionePerTipo(calcolaDistribuzioneTipo(data.issueCreate));
        report.setDistribuzionePerPriorita(calcolaDistribuzionePriorita(data.issueCreate));
        report.setAllerteCritiche(data.allerteCritiche);

        List<ReportUtenteDTO> reportUtenti = new ArrayList<>();
        for (Utenti membro : data.membri) {
            reportUtenti.add(buildReportUtente(membro, data, progetto, idProgetto));
        }
        report.setPerformanceUtenti(reportUtenti);

        return report;
    }

    private ReportUtenteDTO buildReportUtente(Utenti membro, FilteredReportData data,
                                               Progetti progetto, int idProgetto) {
        ReportUtenteDTO dto = new ReportUtenteDTO();
        dto.setUtente(new UtentiDTO(membro));

        long create = data.issueCreate.stream()
                .filter(i -> membro.equals(i.getAutore())).count();
        dto.setIssueCreate(create);

        long assegnateAttuali = (idProgetto != 0)
                ? issueRepository.countByAssegnatarioAndIdProgetto(membro, progetto)
                : issueRepository.countByAssegnatario(membro);
        dto.setIssueAssegnate(assegnateAttuali);

        List<Issue> risolteDaUtente = data.issueRisolte.stream()
                .filter(i -> membro.equals(i.getAssegnatario())).toList();
        dto.setIssueRisolte(risolteDaUtente.size());
        dto.setTempoMedioRisoluzionePersonale(calcolaTempoMedioRisoluzione(risolteDaUtente));

        double efficienza = (assegnateAttuali == 0) ? 0.0 : ((double) risolteDaUtente.size() / assegnateAttuali) * 100;
        dto.setEfficienza(Math.round(efficienza * 100.0) / 100.0);

        return dto;
    }

    private double calcolaTempoMedioRisoluzione(List<Issue> issues) {
        if (issues.isEmpty()) return 0.0;
        long sommaOre = 0;
        for (Issue i : issues) {
            if (i.getDataUltimoAggiornamento() == null || i.getDataCreazione() == null) continue;
            long diffInMillies = Math.abs(i.getDataUltimoAggiornamento().getTime() - i.getDataCreazione().getTime());
            sommaOre += TimeUnit.HOURS.convert(diffInMillies, TimeUnit.MILLISECONDS);
        }
        return (double) sommaOre / issues.size();
    }

    private Map<String, Double> calcolaDistribuzioneTipo(List<Issue> issues) {
        Map<String, Double> map = new HashMap<>();
        if (issues.isEmpty()) return map;
        double totale = issues.size();

        for (tipo_issue tipo : tipo_issue.values()) {
            long count = issues.stream().filter(i -> i.getTipoIssue() == tipo).count();
            map.put(tipo.name(), Math.round((count / totale) * 1000.0) / 10.0);
        }
        return map;
    }

    private Map<String, Double> calcolaDistribuzionePriorita(List<Issue> issues) {
        Map<String, Double> map = new HashMap<>();
        if (issues.isEmpty()) return map;
        double totale = issues.size();

        for (priorita_issue priorita : priorita_issue.values()) {
            long count = issues.stream().filter(i -> i.getPrioritaIssue() == priorita).count();
            map.put(priorita.name(), Math.round((count / totale) * 1000.0) / 10.0);
        }
        return map;
    }

    // Inner data holder classes to reduce method parameter count
    private static class ReportDataHolder {
        final List<Issue> issueCreate;
        final List<Issue> issueRisolte;
        final List<IssueDTO> allerteCritiche;
        final long totaleIssueAperte;

        ReportDataHolder(List<Issue> issueCreate, List<Issue> issueRisolte,
                         List<IssueDTO> allerteCritiche, long totaleIssueAperte) {
            this.issueCreate = issueCreate;
            this.issueRisolte = issueRisolte;
            this.allerteCritiche = allerteCritiche;
            this.totaleIssueAperte = totaleIssueAperte;
        }
    }

    private static class FilteredReportData {
        final List<Issue> issueCreate;
        final List<Issue> issueRisolte;
        final List<IssueDTO> allerteCritiche;
        final long totaleIssueAperte;
        final List<Utenti> membri;

        FilteredReportData(List<Issue> issueCreate, List<Issue> issueRisolte,
                           List<IssueDTO> allerteCritiche, long totaleIssueAperte, List<Utenti> membri) {
            this.issueCreate = issueCreate;
            this.issueRisolte = issueRisolte;
            this.allerteCritiche = allerteCritiche;
            this.totaleIssueAperte = totaleIssueAperte;
            this.membri = membri;
        }
    }
}