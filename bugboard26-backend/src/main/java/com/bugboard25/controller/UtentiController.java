package com.bugboard25.controller;

import com.bugboard25.dto.*;
import com.bugboard25.service.IssueService;
import com.bugboard25.service.NotificheService;
import com.bugboard25.service.UtentiService;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
public class UtentiController {

    private final UtentiService utentiService;
    private final IssueService issueService;
    private final NotificheService notificheService;

    public UtentiController(UtentiService utentiService, IssueService issueService,
                            NotificheService notificheService) {
        this.utentiService = utentiService;
        this.issueService = issueService;
        this.notificheService = notificheService;
    }

    @GetMapping
    public ResponseEntity<List<UtentiDTO>> getAllUtenti() {
        List<UtentiDTO> utenti = utentiService.getUtenti();
        return ResponseEntity.ok(utenti);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UtentiDTO> getUtentiByEmail(@PathVariable String email) {
        UtentiDTO utente = utentiService.getUtentiByEmail(email);
        return ResponseEntity.ok(utente);
    }

    @GetMapping("{email}/issues")
    public ResponseEntity<List<IssueDTO>> getIssuesAssegnate(
            @PathVariable String email,
            @RequestParam("idProgetto") int idProgetto,
            java.security.Principal principal) {

        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<IssueDTO> issues = issueService.getIssueAssegnate(email, idProgetto, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{email}/issuesCreate")
    public ResponseEntity<List<IssueDTO>> getIssuesCreate(@PathVariable String email,
            java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<IssueDTO> issues = issueService.getIssueByAutore(email, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{email}/notifiche")
    public ResponseEntity<List<NotificheDTO>> getNotifiche(@PathVariable String email) {
        List<NotificheDTO> notifiche = notificheService.getNotificheByDestinatario(email);
        return ResponseEntity.ok(notifiche);
    }

    @PostMapping
    public ResponseEntity<UtentiDTO> createUtenti(@RequestBody UtenteCreateRequestDTO dto) {
        UtentiDTO nuovoUtente = utentiService.creaUtente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuovoUtente);
    }

    @PutMapping("/{email}")
    public ResponseEntity<UtentiDTO> updateUtente(@PathVariable String email, @RequestBody UtenteCreateRequestDTO dto) {
        UtentiDTO utenteAggiornato = utentiService.updateUtenteByEmail(email, dto);
        return ResponseEntity.ok(utenteAggiornato);
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Void> verifyPassword(@RequestBody VerificaPasswordRequestDTO dto,
                                                java.security.Principal principal) {
        boolean isValid = utentiService.verificaPassword(principal.getName(), dto.getPassword());
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> deleteUtenteByEmail(@RequestBody CancellazioneUtenteDTO utenteDTO) {
        utentiService.deleteUtenteByEmail(utenteDTO);
        return ResponseEntity.noContent().build();
    }
}
