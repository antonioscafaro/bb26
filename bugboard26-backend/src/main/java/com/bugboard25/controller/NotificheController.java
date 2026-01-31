package com.bugboard25.controller;

import com.bugboard25.dto.NotificheAssegnazioneCreateRequestDTO;
import com.bugboard25.dto.NotificheDTO;
import com.bugboard25.dto.NotificheMenzioneCreateRequestDTO;
import com.bugboard25.entity.Notifiche;
import com.bugboard25.service.NotificheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifiche")
public class NotificheController {
    @Autowired
    private NotificheService notificheService;

    @PostMapping("/menzione")
    public ResponseEntity<NotificheDTO> creaNotificaMenzione(@RequestBody NotificheMenzioneCreateRequestDTO dto){
        NotificheDTO nuovaNotifica = notificheService.creaNotificaMenzione(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuovaNotifica);
    }

    @GetMapping("/destinatario/{emailDestinatario}")
    public ResponseEntity<List<NotificheDTO>> getNotificheByDestinatario(@PathVariable String emailDestinatario){
        List<NotificheDTO> notifiche = notificheService.getNotificheByDestinatario(emailDestinatario);
        return ResponseEntity.status(HttpStatus.OK).body(notifiche);
    }

    @PutMapping("/id/{id}/leggi")
    public ResponseEntity<NotificheDTO> segnaComeLetta(@PathVariable int id){
        NotificheDTO notificaLetta = notificheService.leggiNotifica(id);
        return ResponseEntity.status(HttpStatus.OK).body(notificaLetta);
    }

    @PutMapping("/destinatario/{emailDestinatario}")
    public ResponseEntity<List<NotificheDTO>> segnaTutteLette(@PathVariable String emailDestinatario){
        List<NotificheDTO> notificheLette = notificheService.leggiTutte(emailDestinatario);
        return ResponseEntity.status(HttpStatus.OK).body(notificheLette);
    }
}
