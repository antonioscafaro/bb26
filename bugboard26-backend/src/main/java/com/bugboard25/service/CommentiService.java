package com.bugboard25.service;

import com.bugboard25.dto.CommentiCreateRequestDTO;
import com.bugboard25.dto.CommentoCompletoDTO;
import com.bugboard25.dto.NotificheMenzioneCreateRequestDTO;
import com.bugboard25.entity.Commenti;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Utenti;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.CommentiRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.stereotype.Service;
import com.bugboard25.dto.AutoreCommentoDTO;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentiService {

    private final CommentiRepository commentiRepository;
    private final IssueRepository issueRepository;
    private final UtentiRepository utentiRepository;
    private final NotificheService notificheService;
    private final SseService sseService;

    public CommentiService(CommentiRepository commentiRepository, IssueRepository issueRepository,
            UtentiRepository utentiRepository,
            NotificheService notificheService, SseService sseService) {
        this.commentiRepository = commentiRepository;
        this.issueRepository = issueRepository;
        this.utentiRepository = utentiRepository;
        this.notificheService = notificheService;
        this.sseService = sseService;
    }

    public List<CommentoCompletoDTO> getAllByIssue(int issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        List<Commenti> commenti = commentiRepository.findAllByIssue(issue);

        return commenti.stream().map(c -> {
            List<String> emails = estraiMenzioni(c.getTesto());
            List<AutoreCommentoDTO> menzionati = new ArrayList<>();
            for (String email : emails) {
                utentiRepository.findById(email)
                        .ifPresent(u -> menzionati.add(new AutoreCommentoDTO(u)));
            }
            return new CommentoCompletoDTO(c, menzionati);
        }).toList();
    }

    public List<String> estraiMenzioni(String testoDelCommento) {
        List<String> emailMenzionati = new ArrayList<>();

        String regex = "\\B@([\\w.+%-]+@[\\w.-]+\\.[a-zA-Z]{2,})";

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
            try {
                NotificheMenzioneCreateRequestDTO dtoMenzione = new NotificheMenzioneCreateRequestDTO();
                dtoMenzione.setIdCommento(commenti.getId());
                dtoMenzione.setMenzionante(commenti.getAutore().getNome());
                dtoMenzione.setDestinatario(utenteMenzionato);
                dtoMenzione.setTesto(
                        "Sei stato menzionato da: " + commenti.getAutore().getNome() + " in " + issue.getTitolo());

                notificheService.creaNotificaMenzione(dtoMenzione);
            } catch (Exception e) {
                // Se la menzione non corrisponde a un utente valido, si continua senza bloccare
            }
        }

        List<AutoreCommentoDTO> menzionati = new ArrayList<>();
        for (String utenteMenzionato : utentiMenzionati) {
            utentiRepository.findById(utenteMenzionato)
                    .ifPresent(u -> menzionati.add(new AutoreCommentoDTO(u)));
        }

        sseService.notifyProjectMembers(issue.getIdProgetto().getId(), ErrorMessages.ISSUE_UPDATE);

        return new CommentoCompletoDTO(commenti, menzionati);
    }
}
