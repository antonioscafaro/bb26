package com.bugboard25.service;

import com.bugboard25.dto.CommentiCreateRequestDTO;
import com.bugboard25.dto.CommentoCompletoDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.dto.NotificheMenzioneCreateRequestDTO;
import com.bugboard25.entity.Commenti;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.ProgettoMembri;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.TipoRuolo;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.CommentiRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.ProgettoMembriRepository;
import com.bugboard25.repository.UtentiRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentiService {

    private static final Logger logger = LoggerFactory.getLogger(CommentiService.class);

    private final CommentiRepository commentiRepository;
    private final IssueRepository issueRepository;
    private final UtentiRepository utentiRepository;
    private final ProgettiRepository progettiRepository;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final NotificheService notificheService;
    private final UtentiService utentiService;
    private final SseService sseService;

    public CommentiService(CommentiRepository commentiRepository, IssueRepository issueRepository,
                           UtentiRepository utentiRepository, ProgettiRepository progettiRepository,
                           ProgettoMembriRepository progettoMembriRepository, NotificheService notificheService,
                           UtentiService utentiService, SseService sseService) {
        this.commentiRepository = commentiRepository;
        this.issueRepository = issueRepository;
        this.utentiRepository = utentiRepository;
        this.progettiRepository = progettiRepository;
        this.progettoMembriRepository = progettoMembriRepository;
        this.notificheService = notificheService;
        this.utentiService = utentiService;
        this.sseService = sseService;
    }

    public List<CommentoCompletoDTO> getAllByIssue(int issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        List<Commenti> commenti = commentiRepository.findAllByIssue(issue);

        return commenti.stream()
                .map(CommentoCompletoDTO::new)
                .toList();
    }

    public List<String> estraiMenzioni(String testoDelCommento) {
        List<String> emailMenzionati = new ArrayList<>();

        String regex = "\\B@([\\w]+)";

        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(testoDelCommento);

        while (matcher.find()) {
            String emailUtente = matcher.group(1);
            emailMenzionati.add(emailUtente);
        }

        return emailMenzionati;
    }

    public CommentoCompletoDTO creaCommento(CommentiCreateRequestDTO dto) {
        Issue issue = issueRepository.findById(dto.getIdIssue())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        Utenti autore = utentiRepository.findById(dto.getAutore())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        Commenti commenti = new Commenti();
        commenti.setTesto(dto.getTesto());
        commenti.setAutore(autore);
        commenti.setIssue(issue);
        Date data = new Date();
        commenti.setDataCreazione(data);
        commenti = commentiRepository.save(commenti);

        List<String> utentiMenzionati = estraiMenzioni(commenti.getTesto());
        for (String utenteMenzionato : utentiMenzionati) {
            NotificheMenzioneCreateRequestDTO dtoMenzione = new NotificheMenzioneCreateRequestDTO();
            dtoMenzione.setIdCommento(commenti.getId());
            dtoMenzione.setMenzionante(commenti.getAutore().getNome());
            dtoMenzione.setDestinatario(utenteMenzionato);
            dtoMenzione.setTesto("Sei stato menzionato da: " + utenteMenzionato);

            notificheService.creaNotificaMenzione(dtoMenzione);
        }

        broadcastIssueUpdate(issue.getIdProgetto().getId());

        return new CommentoCompletoDTO(commenti);
    }

    private void broadcastIssueUpdate(int projectId) {
        try {
            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                List<ProgettoMembri> membri = progettoMembriRepository.findByProgetto(progettoOpt.get());
                for (ProgettoMembri membro : membri) {
                    sseService.sendUpdateSignal(membro.getUtente().getEmail(), ErrorMessages.ISSUE_UPDATE);
                }
            }
            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(TipoRuolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                sseService.sendUpdateSignal(amministratore.getEmail(), ErrorMessages.ISSUE_UPDATE);
            }
        } catch (Exception e) {
            logger.error("Failed to broadcast comment update: {}", e.getMessage());
        }
    }
}

