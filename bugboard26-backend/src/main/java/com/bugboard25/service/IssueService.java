package com.bugboard25.service;

import com.bugboard25.dto.*;
import com.bugboard25.entity.*;
import com.bugboard25.entity.enumerations.PrioritaIssue;
import com.bugboard25.entity.enumerations.StatoIssue;
import com.bugboard25.entity.enumerations.TipoIssue;
import com.bugboard25.entity.enumerations.TipoRuolo;
import com.bugboard25.exception.*;
import com.bugboard25.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final UtentiRepository utentiRepository;
    private final ProgettiRepository progettiRepository;
    private final EtichetteRepository etichetteRepository;
    private final NotificheService notificheService;
    private final AllegatiService allegatiService;
    private final IssueEtichetteService issueEtichetteService;
    private final EtichetteService etichetteService;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final UtentiService utentiService;
    private final SseService sseService;

    public IssueService(IssueRepository issueRepository, UtentiRepository utentiRepository,
            ProgettiRepository progettiRepository, EtichetteRepository etichetteRepository,
            NotificheService notificheService, AllegatiService allegatiService,
            IssueEtichetteService issueEtichetteService, EtichetteService etichetteService,
            ProgettoMembriRepository progettoMembriRepository, UtentiService utentiService,
            SseService sseService) {
        this.issueRepository = issueRepository;
        this.utentiRepository = utentiRepository;
        this.progettiRepository = progettiRepository;
        this.etichetteRepository = etichetteRepository;
        this.notificheService = notificheService;
        this.allegatiService = allegatiService;
        this.issueEtichetteService = issueEtichetteService;
        this.etichetteService = etichetteService;
        this.progettoMembriRepository = progettoMembriRepository;
        this.utentiService = utentiService;
        this.sseService = sseService;
    }

    private void notifyProjectMembers(int projectId) {
        try {
            java.util.Set<String> emailsDaNotificare = new java.util.LinkedHashSet<>();

            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                List<ProgettoMembri> membri = progettoMembriRepository.findByProgetto(progettoOpt.get());
                for (ProgettoMembri membro : membri) {
                    emailsDaNotificare.add(membro.getUtente().getEmail());
                }
            }

            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(TipoRuolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                emailsDaNotificare.add(amministratore.getEmail());
            }

            for (String email : emailsDaNotificare) {
                sseService.sendUpdateSignal(email, ErrorMessages.ISSUE_UPDATE);
            }
        } catch (Exception e) {
            // SSE broadcast failure is non-critical
        }
    }

    public IssueDTO getIssueById(int id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));
        return new IssueDTO(issue);
    }

    private List<Issue> filterVisibleIssues(List<Issue> issues, String emailRichiedente) {
        if (emailRichiedente == null)
            return issues;

        Utenti richiedente = utentiRepository.findById(emailRichiedente).orElse(null);
        if (richiedente == null)
            return issues;

        if (richiedente.getRuolo() == TipoRuolo.AMMINISTRATORE) {
            return issues;
        }

        return issues.stream()
                .filter(i -> {
                    if (i.getStatoIssue() == StatoIssue.CHIUSA) {
                        boolean isAssignee = i.getAssegnatario() != null
                                && i.getAssegnatario().getEmail().equals(emailRichiedente);
                        boolean isAuthor = i.getAutore() != null && i.getAutore().getEmail().equals(emailRichiedente);
                        return isAssignee || isAuthor;
                    }
                    return true;
                })
                .toList();
    }

    public List<IssueDTO> getIssuesByProgetto(Integer idProgetto, String emailRichiedente, Sort sort) {
        Progetti progetto = progettiRepository.findById(idProgetto)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        List<Issue> issues = issueRepository.findAllByIdProgetto(progetto, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueAssegnate(String email, int idProgetto, String emailRichiedente, Sort sort) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));
        Progetti progetto = progettiRepository.findById(idProgetto)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        List<Issue> issues = issueRepository.findAllByAssegnatarioAndIdProgetto(utente, progetto, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueByStato(StatoIssue statoIssue, String emailRichiedente, Sort sort) {
        List<Issue> issues = issueRepository.findAllByStatoIssue(statoIssue, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueByPriorita(PrioritaIssue prioritaIssue, String emailRichiedente, Sort sort) {
        List<Issue> issues = issueRepository.findAllByPrioritaIssue(prioritaIssue, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueByData(Date dataInizio, Date dataFine, String emailRichiedente, Sort sort) {
        List<Issue> issues = issueRepository.findAllByDataCreazioneBetween(dataInizio, dataFine, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueByAutore(String email, String emailRichiedente, Sort sort) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));
        List<Issue> issues = issueRepository.findAllByAutore(utente, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueByTipo(TipoIssue tipoIssue, String emailRichiedente, Sort sort) {
        List<Issue> issues = issueRepository.findAllByTipoIssue(tipoIssue, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public List<IssueDTO> getIssueByEtichetta(int idEtichetta, String emailRichiedente, Sort sort) {
        Etichette etichetta = etichetteRepository.findById(idEtichetta)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ETICHETTA_NON_TROVATA));
        List<Issue> issues = issueRepository.findByEtichetta(etichetta, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .toList();
    }

    public IssueDTO creaIssue(IssueCreateRequestDTO requestDTO, MultipartFile file) {
        Progetti progetto = progettiRepository.findById(requestDTO.getIdProgetto())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));
        Utenti autore = utentiRepository.findById(requestDTO.getEmailAutore())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        Issue issue = new Issue();
        issue.setTitolo(requestDTO.getTitolo());
        issue.setDescrizione(requestDTO.getDescrizione());
        issue.setTipoIssue(requestDTO.getTipoIssue());
        issue.setPrioritaIssue(
                requestDTO.getPrioritaIssue() != null ? requestDTO.getPrioritaIssue() : PrioritaIssue.NESSUNA);
        issue.setStatoIssue(StatoIssue.TODO);
        issue.setAutore(autore);
        issue.setIdProgetto(progetto);
        issue.setDataCreazione(new Date());
        issue.setDataUltimoAggiornamento(new Date());

        issue = issueRepository.save(issue);

        if (file != null && !file.isEmpty()) {
            try {
                allegatiService.salvaFile(file, issue.getId());
            } catch (IOException e) {
                throw new FileUploadException(
                        "Upload file fallito. L'issue è stata creata (" + issue.getId() + ") ma l'allegato no.", e);
            }
        }

        if (requestDTO.getEtichette() != null && !requestDTO.getEtichette().isEmpty()) {
            for (String nomeEtichetta : requestDTO.getEtichette()) {
                Etichette etichettaDaAssociare = etichetteService.findOrCreate(nomeEtichetta, progetto);

                IssueEtichettaCreateRequestDTO dtoAssociazione = new IssueEtichettaCreateRequestDTO();
                dtoAssociazione.setIdIssue(issue.getId());
                dtoAssociazione.setIdEtichetta(etichettaDaAssociare.getId());

                issueEtichetteService.associaEtichetta(dtoAssociazione);
            }
        }

        notifyProjectMembers(progetto.getId());
        Issue updatedIssue = issueRepository.findById(issue.getId()).orElse(issue);
        return new IssueDTO(updatedIssue);
    }

    public IssueDTO updateIssueById(int id, IssueUpdateRequestDTO requestDTO, String emailRichiedente) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        Utenti richiedente = utentiRepository.findById(emailRichiedente)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        Progetti progetto = progettiRepository.findById(issue.getIdProgetto().getId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        validatePermissions(issue, richiedente, emailRichiedente, requestDTO);

        if (requestDTO.getAssegnatario() != null) {
            handleAssignment(issue, requestDTO.getAssegnatario());
        }

        if (requestDTO.getDescrizione() != null)
            issue.setDescrizione(requestDTO.getDescrizione());
        if (requestDTO.getTipoIssue() != null)
            issue.setTipoIssue(requestDTO.getTipoIssue());
        if (requestDTO.getStatoIssue() != null)
            issue.setStatoIssue(requestDTO.getStatoIssue());
        if (requestDTO.getPrioritaIssue() != null)
            issue.setPrioritaIssue(requestDTO.getPrioritaIssue());
        if (requestDTO.getTitolo() != null)
            issue.setTitolo(requestDTO.getTitolo());

        if (requestDTO.getEtichette() != null && !requestDTO.getEtichette().isEmpty()) {
            for (String nomeEtichetta : requestDTO.getEtichette()) {
                Etichette etichettaDaAssociare = etichetteService.findOrCreate(nomeEtichetta, progetto);

                IssueEtichettaCreateRequestDTO dtoAssociazione = new IssueEtichettaCreateRequestDTO();
                dtoAssociazione.setIdIssue(issue.getId());
                dtoAssociazione.setIdEtichetta(etichettaDaAssociare.getId());

                issueEtichetteService.associaEtichetta(dtoAssociazione);
            }
        }

        issue.setDataUltimoAggiornamento(new Date());
        issue = issueRepository.save(issue);
        notifyProjectMembers(issue.getIdProgetto().getId());
        return new IssueDTO(issue);
    }

    private void validatePermissions(Issue issue, Utenti richiedente, String emailRichiedente,
            IssueUpdateRequestDTO requestDTO) {
        boolean isAdmin = richiedente.getRuolo() == TipoRuolo.AMMINISTRATORE;
        boolean isAssignee = issue.getAssegnatario() != null
                && issue.getAssegnatario().getEmail().equals(emailRichiedente);
        boolean isReporter = issue.getAutore() != null && issue.getAutore().getEmail().equals(emailRichiedente);

        if (!isAdmin && !isAssignee && !isReporter) {
            throw new ForbiddenException(ErrorMessages.PERMESSO_NEGATO);
        }

        // Autore: può modificare tutto TRANNE l'assegnatario
        if (isReporter && !isAdmin && requestDTO.getAssegnatario() != null) {
            throw new ForbiddenException(ErrorMessages.AUTORE_NO_ASSEGNATARIO);
        }

        // Assegnatario (non autore): NON può modificare la descrizione
        if (isAssignee && !isAdmin && !isReporter && requestDTO.getDescrizione() != null) {
            throw new ForbiddenException(ErrorMessages.ASSEGNATARIO_NO_DESCRIZIONE);
        }
    }

    private void handleAssignment(Issue issue, String assegnatarioEmail) {
        if (assegnatarioEmail.isEmpty()) {
            issue.setAssegnatario(null);
            return;
        }

        Utenti assegnatario = utentiRepository.findById(assegnatarioEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Assegnatario non trovato"));

        com.bugboard25.entity.composedprimarykeys.ProgettoMembriPrimaryKey pk = new com.bugboard25.entity.composedprimarykeys.ProgettoMembriPrimaryKey(
                issue.getIdProgetto().getId(), assegnatario.getEmail());

        if (!progettoMembriRepository.existsById(pk) && assegnatario.getRuolo() != TipoRuolo.AMMINISTRATORE) {
            throw new BadRequestException(ErrorMessages.UTENTE_NON_MEMBRO);
        }

        if (issue.getAssegnatario() == null || !issue.getAssegnatario().getEmail().equals(assegnatario.getEmail())) {
            NotificheAssegnazioneCreateRequestDTO dtoNotifica = new NotificheAssegnazioneCreateRequestDTO();
            dtoNotifica.setDestinatario(assegnatario.getEmail());
            dtoNotifica.setIdIssue(issue.getId());
            dtoNotifica.setTesto("Ti è stata assegnata l'issue: " + issue.getTitolo());
            notificheService.creaNotificaAssegnazione(dtoNotifica);
        }
        issue.setAssegnatario(assegnatario);
    }

    public IssueDTO archiviaIssueById(int id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        issue.setStatoIssue(StatoIssue.ARCHIVIATA);
        issue = issueRepository.save(issue);
        notifyProjectMembers(issue.getIdProgetto().getId());
        return new IssueDTO(issue);
    }
}
