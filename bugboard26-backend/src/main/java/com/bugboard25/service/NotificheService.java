package com.bugboard25.service;

import com.bugboard25.dto.AutoreCommentoDTO;
import com.bugboard25.dto.NotificheAssegnazioneCreateRequestDTO;
import com.bugboard25.dto.NotificheDTO;
import com.bugboard25.dto.NotificheMenzioneCreateRequestDTO;
import com.bugboard25.entity.Commenti;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Notifiche;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.tipo_notifica;
import com.bugboard25.repository.CommentiRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.NotificheRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Date;
import java.util.stream.Collectors;

@Service
public class NotificheService {
    @Autowired
    private NotificheRepository notificheRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UtentiRepository utentiRepository;

    @Autowired
    private CommentiRepository commentiRepository;

    @Autowired
    private SseService sseService;

    public List<NotificheDTO> getNotificheByDestinatario(String destinatario) {
        Utenti destinatarioUtente = utentiRepository.findById(destinatario)
                .orElseThrow(() -> new RuntimeException("Destinatario non trovato"));
        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<Notifiche> notificheLette = notificheRepository.findAllByDestinatarioAndLetto(destinatarioUtente, sort, true);
        List<Notifiche> notificheNonLette = notificheRepository.findAllByDestinatarioAndLettoIsFalse(destinatarioUtente, sort);

        List<Notifiche> notifiche = new ArrayList();
        notifiche.addAll(notificheNonLette);
        notifiche.addAll(notificheLette);

        return notifiche
                .stream()
                .map(NotificheDTO::new)
                .collect(Collectors.toList());
    }

    public NotificheDTO creaNotificaAssegnazione(NotificheAssegnazioneCreateRequestDTO dto){
        Utenti utente = utentiRepository.findById(dto.getDestinatario())
                .orElseThrow(() -> new RuntimeException("Destinatario non trovato"));

        Issue issue = issueRepository.findById(dto.getIdIssue())
                .orElseThrow(() -> new RuntimeException("Id issue non trovato"));

        Notifiche notifica = new Notifiche();
        notifica.setDestinatario(utente);
        notifica.setTesto(dto.getTesto());
        notifica.setTipo_notifica(tipo_notifica.ASSEGNATA);
        notifica.setDataCreazione(new Date());
        notifica.setLetto(false);
        notifica.setIssue(issue);

        notifica = notificheRepository.save(notifica);
        sseService.sendUpdateSignal(utente.getEmail(), "notification-update");
        return new NotificheDTO(notifica);
    }

    public NotificheDTO creaNotificaMenzione(NotificheMenzioneCreateRequestDTO dto){
        Utenti utente = utentiRepository.findById(dto.getDestinatario())
                .orElseThrow(() -> new RuntimeException("Destinatario non trovato"));

        Commenti commento = commentiRepository.findById(dto.getIdCommento())
                .orElseThrow(() -> new RuntimeException("Commento non trovato"));

        Issue issue = commento.getIssue();

        Notifiche notifica = new Notifiche();
        notifica.setDestinatario(utente);
        notifica.setTesto(dto.getTesto());
        notifica.setTipo_notifica(tipo_notifica.MENZIONE);
        notifica.setDataCreazione(new Date());
        notifica.setLetto(false);
        notifica.setIssue(issue);

        notifica = notificheRepository.save(notifica);
        sseService.sendUpdateSignal(utente.getEmail(), "notification-update");
        return new NotificheDTO(notifica);
    }

    public NotificheDTO leggiNotifica(int idNotifica){
        Notifiche notifica = notificheRepository.findById(idNotifica)
                .orElseThrow(() -> new RuntimeException("Notifica non trovata"));

        notifica.setLetto(true);
        notifica = notificheRepository.save(notifica);
        return new NotificheDTO(notifica);
    }

    public List<NotificheDTO> leggiTutte(String destinatario){
        Utenti destinatarioUtente = utentiRepository.findById(destinatario)
                .orElseThrow(() -> new RuntimeException("Destinatario non trovato"));

        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");

        List<Notifiche> notifiche = notificheRepository.findAllByDestinatarioAndLettoIsFalse(destinatarioUtente, sort);

        if (notifiche.isEmpty()){
            return notifiche
                    .stream()
                    .map(NotificheDTO::new)
                    .collect(Collectors.toList());
        }

        for (Notifiche notifica : notifiche){
            notifica.setLetto(true);
        }

        return notificheRepository.saveAll(notifiche)
                .stream()
                .map(NotificheDTO::new)
                .collect(Collectors.toList());
    }

    public void creaNotificaProgetto(Utenti destinatario, String testo) {
        Notifiche notifica = new Notifiche();
        notifica.setDestinatario(destinatario);
        notifica.setTesto(testo);
        notifica.setTipo_notifica(tipo_notifica.PROGETTO);
        notifica.setDataCreazione(new Date());
        notifica.setLetto(false);
        // issue is null

        notificheRepository.save(notifica);
        sseService.sendUpdateSignal(destinatario.getEmail(), "notification-update");
        // Also trigger project update since a project membership changed
        sseService.sendUpdateSignal(destinatario.getEmail(), "project-update");
    }
}
