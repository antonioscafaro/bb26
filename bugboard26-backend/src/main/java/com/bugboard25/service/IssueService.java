package com.bugboard25.service;

import com.bugboard25.dto.*;
import com.bugboard25.entity.*;
import com.bugboard25.entity.enumerations.priorita_issue;
import com.bugboard25.entity.enumerations.stato_issue;
import com.bugboard25.entity.enumerations.tipo_issue;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import com.bugboard25.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IssueService {
    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UtentiRepository utentiRepository;

    @Autowired
    private ProgettiRepository progettiRepository;

    @Autowired
    private EtichetteRepository etichetteRepository;

    @Autowired
    private NotificheService notificheService;

    @Autowired
    private AllegatiService allegatiService;

    @Autowired
    private Issue_EtichetteService issue_etichetteService;

    @Autowired
    private EtichetteService etichetteService;

    @Autowired
    private Progetto_MembriRepository progetto_MembriRepository;

    @Autowired
    private UtentiService utentiService;

    @Autowired
    private SseService sseService;

    private void notifyProjectMembers(int projectId) {
         try {
             // Fix: Fetch existing project reference instead of new Progetti(id)
             Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
             if (progettoOpt.isPresent()) {
                 List<Progetto_Membri> membri = progetto_MembriRepository.findByProgetto(progettoOpt.get());
                 for (Progetto_Membri membro : membri) {
                     sseService.sendUpdateSignal(membro.getUtente().getEmail(), "issue-update");
                 }
             }

             List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(tipo_ruolo.AMMINISTRATORE);
             for (UtentiDTO amministratore : amministratori) {
                 sseService.sendUpdateSignal(amministratore.getEmail(), "issue-update");
             }
         } catch (Exception e) {
             System.err.println("Failed to broadcast issue update: " + e.getMessage());
         }
    }

    public IssueDTO getIssueById(int id) {
        Optional<Issue> issues = issueRepository.findById(id);
        if (issues.isEmpty()) {
            throw new RuntimeException("Issue non esistente");
        }

        return new IssueDTO(issues.get());
    }

    // Helper per la visibilità:
    // Admin: vede tutto.
    // User: non vede le issue che sono nello stato CHIUSA (rejected) se non sono assegnate a lui o create da lui.
    private List<Issue> filterVisibleIssues(List<Issue> issues, String emailRichiedente) {
        if (emailRichiedente == null) return issues; // Should not happen in secured loop

        Utenti richiedente = utentiRepository.findById(emailRichiedente).orElse(null);
        if (richiedente == null) return issues;

        if (richiedente.getRuolo() == tipo_ruolo.AMMINISTRATORE) {
            return issues;
        }

        return issues.stream()
                .filter(i -> {
                    // Se lo stato è CHIUSA (Rejected), deve essere mio (Assegnatario o Autore)
                    if (i.getStatoIssue() == stato_issue.CHIUSA) {
                        boolean isAssignee = i.getAssegnatario() != null && i.getAssegnatario().getEmail().equals(emailRichiedente);
                        boolean isAuthor = i.getAutore() != null && i.getAutore().getEmail().equals(emailRichiedente);
                        return isAssignee || isAuthor;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssuesByProgetto(Integer idProgetto, String emailRichiedente, Sort sort){
        Optional<Progetti> progetti = progettiRepository.findById(idProgetto);
        if (progetti.isEmpty()){
            throw new RuntimeException("Progetto non trovato");
        }

        List<Issue> issues = issueRepository.findAllByIdProgetto(progetti.get(), sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueAssegnate(String email, int idProgetto, String emailRichiedente, Sort sort){
        Optional<Utenti> utenti = utentiRepository.findById(email);
        Progetti progetto = progettiRepository.findById(idProgetto)
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));
        if (utenti.isEmpty()){
            throw new RuntimeException("Utente non trovato");
        }

        List<Issue> issues = issueRepository.findAllByAssegnatarioAndIdProgetto(utenti.get(), progetto, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueByStato(stato_issue statoIssue, String emailRichiedente, Sort sort){
        List<Issue> issues = issueRepository.findAllByStatoIssue(statoIssue, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueByPriorita(priorita_issue prioritaIssue, String emailRichiedente, Sort sort){
        List<Issue> issues = issueRepository.findAllByPrioritaIssue(prioritaIssue, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueByData(Date dataInizio, Date dataFine, String emailRichiedente, Sort sort){
        List<Issue> issues = issueRepository.findAllByDataCreazioneBetween(dataInizio, dataFine, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueByAutore(String email, String emailRichiedente, Sort sort){
        Optional<Utenti> utenti = utentiRepository.findById(email);
        if (utenti.isEmpty()){
            throw new RuntimeException("Utente non trovato");
        }
        List<Issue> issues = issueRepository.findAllByAutore(utenti.get(), sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueByTipo(tipo_issue tipoIssue, String emailRichiedente, Sort sort){
        List<Issue> issues = issueRepository.findAllByTipoIssue(tipoIssue, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssueByEtichetta(int idEtichetta, String emailRichiedente, Sort sort){
        Etichette etichetta = etichetteRepository.findById(idEtichetta)
                .orElseThrow(() -> new RuntimeException("Etichetta non trovata"));
        List<Issue> issues = issueRepository.findByEtichetta(etichetta, sort);
        return filterVisibleIssues(issues, emailRichiedente)
                .stream()
                .map(IssueDTO::new)
                .collect(Collectors.toList());
    }

    public IssueDTO creaIssue(IssueCreateRequestDTO requestDTO, MultipartFile file){
        Progetti progetto = progettiRepository.findById(requestDTO.getIdProgetto())
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));
        Utenti autore = utentiRepository.findById(requestDTO.getEmailAutore())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Issue issue = new Issue();
        issue.setTitolo(requestDTO.getTitolo());
        issue.setDescrizione(requestDTO.getDescrizione());
        issue.setTipoIssue(requestDTO.getTipoIssue());
        issue.setPrioritaIssue(priorita_issue.NESSUNA);
        issue.setStatoIssue(stato_issue.TODO);
        issue.setAutore(autore);
        issue.setIdProgetto(progetto);
        issue.setDataCreazione(new Date());
        issue.setDataUltimoAggiornamento(new Date());

        issue = issueRepository.save(issue);

        if (file != null && !file.isEmpty()) {
            try {
                AllegatoDTO allegato = allegatiService.salvaFile(file, issue.getId());
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Upload file fallito. L'issue è stata creata (" + issue.getId() + ") ma l'allegato no.", e);
            }
        }

        if (requestDTO.getEtichette() != null && !requestDTO.getEtichette().isEmpty()) {

            for (String nomeEtichetta : requestDTO.getEtichette()) {
                Etichette etichettaDaAssociare = etichetteService.findOrCreate(nomeEtichetta, progetto);

                Issue_EtichettaCreateRequestDTO dtoAssociazione = new Issue_EtichettaCreateRequestDTO();
                dtoAssociazione.setIdIssue(issue.getId());
                dtoAssociazione.setIdEtichetta(etichettaDaAssociare.getId());

                issue_etichetteService.associaEtichetta(dtoAssociazione);
            }
        }

         notifyProjectMembers(progetto.getId());
         // Refresh issue to get the associated labels
         Issue updatedIssue = issueRepository.findById(issue.getId()).orElse(issue);
         return new IssueDTO(updatedIssue);
    }

    public IssueDTO updateIssueById(int id, IssueUpdateRequestDTO requestDTO, String emailRichiedente){
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue non trovato"));

        Utenti richiedente = utentiRepository.findById(emailRichiedente)
                .orElseThrow(() -> new RuntimeException("Utente richiedente non trovato"));

        Progetti progetto = progettiRepository.findById(issue.getIdProgetto().getId())
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));

        boolean isAdmin = richiedente.getRuolo() == com.bugboard25.entity.enumerations.tipo_ruolo.AMMINISTRATORE;
        boolean isAssignee = issue.getAssegnatario() != null && issue.getAssegnatario().getEmail().equals(emailRichiedente);
        boolean isReporter = issue.getAutore() != null && issue.getAutore().getEmail().equals(emailRichiedente);

        if (!isAdmin && !isAssignee && !isReporter) {
             throw new RuntimeException("Non hai i permessi per modificare questa issue.");
        }

        if (requestDTO.getAssegnatario() != null) {
            if (requestDTO.getAssegnatario().isEmpty()) {
                issue.setAssegnatario(null);
            } else {
                Utenti assegnatario = utentiRepository.findById(requestDTO.getAssegnatario())
                        .orElseThrow(() -> new RuntimeException("Assegnatario non trovato"));

                // Verify assignee is member of the project
                com.bugboard25.entity.ComposedPrimaryKeys.Progetto_MembriPrimaryKey pk = 
                    new com.bugboard25.entity.ComposedPrimaryKeys.Progetto_MembriPrimaryKey(issue.getIdProgetto().getId(), assegnatario.getEmail());


                if (!progetto_MembriRepository.existsById(pk) && assegnatario.getRuolo() != tipo_ruolo.AMMINISTRATORE) {
                    throw new RuntimeException("L'utente selezionato non è membro del progetto");
                }
                
                // Send notification only if assignee is different/new
                if (issue.getAssegnatario() == null || !issue.getAssegnatario().getEmail().equals(assegnatario.getEmail())) {
                     NotificheAssegnazioneCreateRequestDTO dtoNotifica = new NotificheAssegnazioneCreateRequestDTO();
                     dtoNotifica.setDestinatario(assegnatario.getEmail());
                     dtoNotifica.setIdIssue(issue.getId());
                     dtoNotifica.setTesto("Ti è stata assegnata l'issue: " + issue.getTitolo());
                     notificheService.creaNotificaAssegnazione(dtoNotifica);
                }
                issue.setAssegnatario(assegnatario);
            }
        }

        if (requestDTO.getDescrizione() != null) issue.setDescrizione(requestDTO.getDescrizione());
        if (requestDTO.getTipoIssue() != null) issue.setTipoIssue(requestDTO.getTipoIssue());
        if (requestDTO.getStatoIssue() != null) issue.setStatoIssue(requestDTO.getStatoIssue());
        if (requestDTO.getPrioritaIssue() != null) issue.setPrioritaIssue(requestDTO.getPrioritaIssue());
        if (requestDTO.getTitolo() != null) issue.setTitolo(requestDTO.getTitolo());

        // Update Labels
        if (requestDTO.getEtichette() != null && !requestDTO.getEtichette().isEmpty()) {

            for (String nomeEtichetta : requestDTO.getEtichette()) {
                Etichette etichettaDaAssociare = etichetteService.findOrCreate(nomeEtichetta, progetto);

                Issue_EtichettaCreateRequestDTO dtoAssociazione = new Issue_EtichettaCreateRequestDTO();
                dtoAssociazione.setIdIssue(issue.getId());
                dtoAssociazione.setIdEtichetta(etichettaDaAssociare.getId());

                issue_etichetteService.associaEtichetta(dtoAssociazione); 
            }
        }

        issue.setDataUltimoAggiornamento(new Date());

        issue = issueRepository.save(issue);
        notifyProjectMembers(issue.getIdProgetto().getId());
        return new IssueDTO(issue);
    }

    public IssueDTO archiviaIssueById(int id){
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue non trovato"));

        issue.setStatoIssue(stato_issue.ARCHIVIATA);
        issue = issueRepository.save(issue);
        notifyProjectMembers(issue.getIdProgetto().getId());
        return new IssueDTO(issue);
    }
}
