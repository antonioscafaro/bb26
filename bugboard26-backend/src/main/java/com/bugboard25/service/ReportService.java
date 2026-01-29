package com.bugboard25.service;

import com.bugboard25.dto.*;
import com.bugboard25.entity.*;
import com.bugboard25.entity.enumerations.*;
import com.bugboard25.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private IssueRepository issueRepository;
    @Autowired
    private ProgettiRepository progettiRepository;
    @Autowired
    private UtentiRepository utentiRepository;

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
        Date dateCriticalLimit = Date.from(LocalDate.now().minusDays(7).atStartOfDay(ZoneId.systemDefault()).toInstant());

        // 1. Fetch Issues Filtering by Date & Project (DB Level)
        List<Issue> issueCreateNelMese;
        List<Issue> issueRisolteNelMese;
        List<IssueDTO> allerteCritiche;
        long totaleIssueAperte;

        Progetti progetto = null;
        if (idProgetto != 0) {
            progetto = progettiRepository.findById(idProgetto)
                    .orElseThrow(() -> new RuntimeException("Progetto non trovato"));
            
            issueCreateNelMese = issueRepository.findByIdProgettoAndDataCreazioneBetween(progetto, dataInizio, dataFine);
            issueRisolteNelMese = issueRepository.findByIdProgettoAndStatoIssueAndDataUltimoAggiornamentoBetween(progetto, stato_issue.RISOLTA, dataInizio, dataFine);
            allerteCritiche = issueRepository.findCriticalAlertsByProject(progetto, dateCriticalLimit)
                    .stream().map(IssueDTO::new).collect(Collectors.toList());
            totaleIssueAperte = issueRepository.countCurrentlyOpenByProject(progetto);
        } else {
            // Global
            issueCreateNelMese = issueRepository.findByDataCreazioneBetween(dataInizio, dataFine);
            issueRisolteNelMese = issueRepository.findByStatoIssueAndDataUltimoAggiornamentoBetween(stato_issue.RISOLTA, dataInizio, dataFine);
            allerteCritiche = issueRepository.findCriticalAlerts(dateCriticalLimit)
                    .stream().map(IssueDTO::new).collect(Collectors.toList());
            totaleIssueAperte = issueRepository.countCurrentlyOpen();
        }

        // 2. Resolve Users
        List<Utenti> membri;
        Utenti utenteSelezionato = null;
        if (emailUtente != null && !emailUtente.isEmpty() && !emailUtente.equals("all")) {
            utenteSelezionato = utentiRepository.findById(emailUtente).orElse(null);
        }

        if (utenteSelezionato != null) {
            membri = Collections.singletonList(utenteSelezionato);
            // Refine Stats for Selected User
            final Utenti u = utenteSelezionato;
            
            // Filter RAM lists (small dataset)
            issueCreateNelMese = issueCreateNelMese.stream()
                    .filter(i -> u.equals(i.getAutore()) || u.equals(i.getAssegnatario()))
                    .collect(Collectors.toList());
            
            issueRisolteNelMese = issueRisolteNelMese.stream()
                    .filter(i -> u.equals(i.getAssegnatario())) // Only resolved BY assignee matters? Or Author too? Original code checked Assegnatario for resolved.
                    .collect(Collectors.toList());
            
            // Recalculate Open for User
            if (idProgetto != 0) {
                totaleIssueAperte = issueRepository.countCurrentlyOpenByProjectAndUser(progetto, u);
            } else {
                totaleIssueAperte = issueRepository.countCurrentlyOpenByUser(u);
            }
        } else {
            // Members list for loop
            if (idProgetto != 0) {
                membri = utentiRepository.findMembriByProgettoId(idProgetto);
            } else {
                membri = utentiRepository.findAll();
            }
        }

        ReportMensileDTO report = new ReportMensileDTO();
        report.setTotaleIssueCreate(issueCreateNelMese.size());
        report.setTotaleIssueRisolte(issueRisolteNelMese.size());
        report.setTotaleIssueAperte(totaleIssueAperte);
        report.setTempoMedioRisoluzioneGlobale(calcolaTempoMedioRisoluzione(issueRisolteNelMese));
        report.setDistribuzionePerTipo(calcolaDistribuzioneTipo(issueCreateNelMese));
        report.setDistribuzionePerPriorita(calcolaDistribuzionePriorita(issueCreateNelMese));
        report.setAllerteCritiche(allerteCritiche);

        // 3. User Performance Loop (Optimized to filter small lists)
        List<ReportUtenteDTO> reportUtenti = new ArrayList<>();
        
        final List<Issue> finalIssueCreate = issueCreateNelMese;
        final List<Issue> finalIssueRisolte = issueRisolteNelMese;

        for (Utenti membro : membri) {
            ReportUtenteDTO dto = new ReportUtenteDTO();
            dto.setUtente(new UtentiDTO(membro));

            long create = finalIssueCreate.stream()
                    .filter(i -> membro.equals(i.getAutore())).count();
            dto.setIssueCreate(create);
            
            // "Assigned" metric: Original code counted ALL assigned issues ever. 
            // We use the separate DB count for accuracy of "Total Workload/History".
            long assegnateAttuali;
            if (idProgetto != 0) {
                assegnateAttuali = issueRepository.countByAssegnatarioAndIdProgetto(membro, progetto);
            } else {
                assegnateAttuali = issueRepository.countByAssegnatario(membro);
            }
            dto.setIssueAssegnate(assegnateAttuali);

            List<Issue> risolteDaUtente = finalIssueRisolte.stream()
                    .filter(i -> membro.equals(i.getAssegnatario())).collect(Collectors.toList());
            dto.setIssueRisolte(risolteDaUtente.size());
            dto.setTempoMedioRisoluzionePersonale(calcolaTempoMedioRisoluzione(risolteDaUtente));

            double efficienza = (assegnateAttuali == 0) ? 0.0 : ((double) risolteDaUtente.size() / assegnateAttuali) * 100;
            dto.setEfficienza(Math.round(efficienza * 100.0) / 100.0);

            reportUtenti.add(dto);
        }
        report.setPerformanceUtenti(reportUtenti);

        return report;
    }

    private double calcolaTempoMedioRisoluzione(List<Issue> issues) {
        if (issues.isEmpty()) return 0.0;
        long sommaOre = 0;
        for (Issue i : issues) {
            if (i.getDataUltimoAggiornamento() == null || i.getDataCreazione() == null) continue;
            long diffInMillies = Math.abs(i.getDataUltimoAggiornamento().getTime() - i.getDataCreazione().getTime());
            sommaOre += TimeUnit.HOURS.convert(diffInMillies, TimeUnit.MILLISECONDS);
        }
        return issues.isEmpty() ? 0.0 : (double) sommaOre / issues.size();
    }

    private Map<String, Double> calcolaDistribuzioneTipo(List<Issue> issues) {
        Map<String, Double> map = new HashMap<>();
        if (issues.isEmpty()) return map;
        double totale = issues.size();
        
        for (tipo_issue tipo : tipo_issue.values()) {
            long count = issues.stream().filter(i -> i.getTipoIssue() == tipo).count();
            map.put(tipo.name(), Math.round((count / totale) * 1000.0) / 10.0); // Round to 1 decimal
        }
        return map;
    }

    private Map<String, Double> calcolaDistribuzionePriorita(List<Issue> issues) {
        Map<String, Double> map = new HashMap<>();
        if (issues.isEmpty()) return map;
        double totale = issues.size();

        for (priorita_issue priorita : priorita_issue.values()) {
            long count = issues.stream().filter(i -> i.getPrioritaIssue() == priorita).count();
            map.put(priorita.name(), Math.round((count / totale) * 1000.0) / 10.0); // Round to 1 decimal
        }
        return map;
    }
}