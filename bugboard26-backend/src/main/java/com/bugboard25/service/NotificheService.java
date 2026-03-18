package com.bugboard25.service;

import com.bugboard25.dto.NotificheAssegnazioneCreateRequestDTO;
import com.bugboard25.dto.NotificheDTO;
import com.bugboard25.dto.NotificheMenzioneCreateRequestDTO;
import com.bugboard25.entity.Commenti;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Notifiche;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.TipoNotifica;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.CommentiRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.NotificheRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Date;

@Service
public class NotificheService {

    private final NotificheRepository notificheRepository;
    private final IssueRepository issueRepository;
    private final UtentiRepository utentiRepository;
    private final CommentiRepository commentiRepository;
    private final SseService sseService;

    public NotificheService(NotificheRepository notificheRepository, IssueRepository issueRepository,
                            UtentiRepository utentiRepository, CommentiRepository commentiRepository,
                            SseService sseService) {
        this.notificheRepository = notificheRepository;
        this.issueRepository = issueRepository;
        this.utentiRepository = utentiRepository;
        this.commentiRepository = commentiRepository;
        this.sseService = sseService;
    }

    public List<NotificheDTO> getNotificheByDestinatario(String destinatario) {
        Utenti destinatarioUtente = utentiRepository.findById(destinatario)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DESTINATARIO_NON_TROVATO));
        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<Notifiche> notificheLette = notificheRepository.findAllByDestinatarioAndLetto(destinatarioUtente, sort, true);
        List<Notifiche> notificheNonLette = notificheRepository.findAllByDestinatarioAndLettoIsFalse(destinatarioUtente, sort);

        List<Notifiche> notifiche = new ArrayList<>();
        notifiche.addAll(notificheNonLette);
        notifiche.addAll(notificheLette);

        return notifiche.stream()
                .map(NotificheDTO::new)
                .toList();
    }

    public NotificheDTO creaNotificaAssegnazione(NotificheAssegnazioneCreateRequestDTO dto) {
        Utenti utente = utentiRepository.findById(dto.getDestinatario())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DESTINATARIO_NON_TROVATO));

        Issue issue = issueRepository.findById(dto.getIdIssue())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        Notifiche notifica = new Notifiche();
        notifica.setDestinatario(utente);
        notifica.setTesto(dto.getTesto());
        notifica.setTipoNotifica(TipoNotifica.ASSEGNATA);
        notifica.setDataCreazione(new Date());
        notifica.setLetto(false);
        notifica.setIssue(issue);

        notifica = notificheRepository.save(notifica);
        sseService.sendUpdateSignal(utente.getEmail(), ErrorMessages.NOTIFICATION_UPDATE);
        return new NotificheDTO(notifica);
    }

    public NotificheDTO creaNotificaMenzione(NotificheMenzioneCreateRequestDTO dto) {
        Utenti utente = utentiRepository.findById(dto.getDestinatario())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DESTINATARIO_NON_TROVATO));

        Commenti commento = commentiRepository.findById(dto.getIdCommento())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.COMMENTO_NON_TROVATO));

        Issue issue = commento.getIssue();

        Notifiche notifica = new Notifiche();
        notifica.setDestinatario(utente);
        notifica.setTesto(dto.getTesto());
        notifica.setTipoNotifica(TipoNotifica.MENZIONE);
        notifica.setDataCreazione(new Date());
        notifica.setLetto(false);
        notifica.setIssue(issue);

        notifica = notificheRepository.save(notifica);
        sseService.sendUpdateSignal(utente.getEmail(), ErrorMessages.NOTIFICATION_UPDATE);
        return new NotificheDTO(notifica);
    }

    public NotificheDTO leggiNotifica(int idNotifica) {
        Notifiche notifica = notificheRepository.findById(idNotifica)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.NOTIFICA_NON_TROVATA));

        notifica.setLetto(true);
        notifica = notificheRepository.save(notifica);
        return new NotificheDTO(notifica);
    }

    public List<NotificheDTO> leggiTutte(String destinatario) {
        Utenti destinatarioUtente = utentiRepository.findById(destinatario)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DESTINATARIO_NON_TROVATO));

        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<Notifiche> notifiche = notificheRepository.findAllByDestinatarioAndLettoIsFalse(destinatarioUtente, sort);

        if (notifiche.isEmpty()) {
            return notifiche.stream()
                    .map(NotificheDTO::new)
                    .toList();
        }

        for (Notifiche notifica : notifiche) {
            notifica.setLetto(true);
        }

        return notificheRepository.saveAll(notifiche).stream()
                .map(NotificheDTO::new)
                .toList();
    }

    public void creaNotificaProgetto(Utenti destinatario, String testo) {
        Notifiche notifica = new Notifiche();
        notifica.setDestinatario(destinatario);
        notifica.setTesto(testo);
        notifica.setTipoNotifica(TipoNotifica.PROGETTO);
        notifica.setDataCreazione(new Date());
        notifica.setLetto(false);

        notificheRepository.save(notifica);
        sseService.sendUpdateSignal(destinatario.getEmail(), ErrorMessages.NOTIFICATION_UPDATE);
        sseService.sendUpdateSignal(destinatario.getEmail(), ErrorMessages.PROJECT_UPDATE);
    }
}
