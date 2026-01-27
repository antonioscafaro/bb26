package com.bugboard25.service;

import com.bugboard25.dto.AutoreCommentoDTO;
import com.bugboard25.dto.CommentiCreateRequestDTO;
import com.bugboard25.dto.CommentoCompletoDTO;
import com.bugboard25.dto.ProgettiDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.dto.NotificheMenzioneCreateRequestDTO;
import com.bugboard25.entity.Commenti;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Notifiche;
import com.bugboard25.entity.Utenti;
import com.bugboard25.repository.CommentiRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.UtentiRepository;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.bugboard25.service.UtentiService;
import com.bugboard25.service.SseService;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CommentiService {
    @Autowired
    private CommentiRepository commentiRepository;
    @Autowired
    private IssueRepository issueRepository;
    @Autowired
    private UtentiRepository utentiRepository;
    @Autowired
    private NotificheService notificheService;
    @Autowired
    private ProgettiService progettiService;
    @Autowired
    private UtentiService utentiService;

    public List<CommentoCompletoDTO> getAllByIssue(int issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Invalid issue"));

        List<Commenti> commenti = commentiRepository.findAllByIssue(issue);

        return commenti.stream()
                .map(commento -> new CommentoCompletoDTO(commento))
                .collect(Collectors.toList());
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
                .orElseThrow(() -> new RuntimeException("Issue non trovata"));

        Utenti autore = utentiRepository.findById(dto.getAutore())
                .orElseThrow(() -> new RuntimeException("Autore non trovata"));

        Commenti commenti = new Commenti();
        commenti.setTesto(dto.getTesto());
        commenti.setAutore(autore);
        commenti.setIssue(issue);
        Date data = new Date();
        commenti.setData_creazione(data);
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
    
    @Autowired
    private SseService sseService;
    
    private void broadcastIssueUpdate(int projectId) {
        List<UtentiDTO> members = utentiService.getUtentiByProgettoId(projectId);
        for (UtentiDTO member : members) {
            sseService.sendEvent(member.getEmail(), "issue-update", "Issue updated in project " + projectId);
        }
        List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(tipo_ruolo.AMMINISTRATORE);
        for (UtentiDTO amministratore : amministratori) {
            sseService.sendUpdateSignal(amministratore.getEmail(), "issue-update");
        }
    }
}
