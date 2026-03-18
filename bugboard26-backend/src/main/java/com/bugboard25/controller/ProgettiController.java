package com.bugboard25.controller;

import com.bugboard25.dto.*;
import com.bugboard25.service.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/progetti")
public class ProgettiController {

    private final ProgettiService progettiService;
    private final UtentiService utentiService;
    private final IssueService issueService;
    private final EtichetteService etichetteService;
    private final ProgettoMembriService progettoMembriService;
    private final ReportService reportService;

    public ProgettiController(ProgettiService progettiService, UtentiService utentiService,
                              IssueService issueService, EtichetteService etichetteService,
                              ProgettoMembriService progettoMembriService, ReportService reportService) {
        this.progettiService = progettiService;
        this.utentiService = utentiService;
        this.issueService = issueService;
        this.etichetteService = etichetteService;
        this.progettoMembriService = progettoMembriService;
        this.reportService = reportService;
    }

    @GetMapping("/{progettoId}/membri")
    public ResponseEntity<List<UtentiDTO>> getMembriDelProgetto(@PathVariable int progettoId) {
        List<UtentiDTO> membri = utentiService.getUtentiByProgettoId(progettoId);
        return ResponseEntity.ok(membri);
    }

    @GetMapping
    public ResponseEntity<List<ProgettiDTO>> getAllProgetti() {
        List<ProgettiDTO> progetti = progettiService.getProgetti();
        return ResponseEntity.ok(progetti);
    }

    @GetMapping("/membri/{email}")
    public ResponseEntity<List<ProgettiDTO>> getProgettiByUtente(@PathVariable String email) {
        List<ProgettiDTO> progetti = progettiService.getProgettiByMembro(email);
        return ResponseEntity.ok(progetti);
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<ReportMensileDTO> getReportMensile(
            @PathVariable int id,
            @RequestParam(defaultValue = "0") int mese,
            @RequestParam(defaultValue = "0") int anno,
            @RequestParam(required = false) String userId) {

        if (mese == 0 || anno == 0) {
            LocalDate now = LocalDate.now();
            if (mese == 0)
                mese = now.getMonthValue();
            if (anno == 0)
                anno = now.getYear();
        }

        ReportMensileDTO report = reportService.generaReport(id, mese, anno, userId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/report")
    public ResponseEntity<ReportMensileDTO> getReportGlobale(
            @RequestParam(defaultValue = "0") int mese,
            @RequestParam(defaultValue = "0") int anno,
            @RequestParam(required = false) String userId) {

        if (mese == 0 || anno == 0) {
            LocalDate now = LocalDate.now();
            if (mese == 0)
                mese = now.getMonthValue();
            if (anno == 0)
                anno = now.getYear();
        }

        ReportMensileDTO report = reportService.generaReport(0, mese, anno, userId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ProgettiDTO> getProgettiById(@PathVariable int id) {
        ProgettiDTO progetto = progettiService.getProgettiById(id);
        return ResponseEntity.ok(progetto);
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<ProgettiDTO>> getProgettiByNome(@PathVariable String nome) {
        List<ProgettiDTO> progetti = progettiService.getProgettiByNome(nome);
        return ResponseEntity.ok(progetti);
    }

    @GetMapping("/{progettoId}/issues")
    public ResponseEntity<List<IssueDTO>> getIssueDelProgetto(@PathVariable int progettoId,
            java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<IssueDTO> issue = issueService.getIssuesByProgetto(progettoId, principal.getName(), sort);
        return ResponseEntity.ok(issue);
    }

    @GetMapping("/{progettoId}/etichette")
    public ResponseEntity<List<EtichettaDTO>> getEtichetteDelProgetto(@PathVariable int progettoId) {
        List<EtichettaDTO> etichette = etichetteService.getEtichetteByProgetti(progettoId);
        return ResponseEntity.ok(etichette);
    }

    @DeleteMapping("/{progettoId}/membri/{email}")
    public ResponseEntity<Void> rimuoviMembroDalProgetto(
            @PathVariable int progettoId,
            @PathVariable String email) {

        progettoMembriService.rimuoviUtente(progettoId, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{progettoId}/membri")
    public ResponseEntity<ProgettoMembriDTO> aggiungiMembroAlProgetto(
            @PathVariable int progettoId,
            @RequestBody ProgettoMembriCreateRequestDTO dto) {

        if (progettoId != dto.getIdProgetto()) {
            return ResponseEntity.badRequest().build();
        }

        ProgettoMembriDTO associazione = progettoMembriService.associaUtenti(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(associazione);
    }

    @PostMapping
    public ResponseEntity<ProgettiDTO> creaProgetto(@RequestBody ProgettoCreateRequestDTO dto) {
        ProgettiDTO nuovoProgetto = progettiService.creaProgetto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuovoProgetto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgettiDTO> updateProgetto(@PathVariable int id, @RequestBody ProgettoCreateRequestDTO dto) {
        ProgettiDTO progettoAggiornato = progettiService.updateProgettoById(id, dto);
        return ResponseEntity.ok(progettoAggiornato);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgetto(@PathVariable int id) {
        progettiService.deleteProgettoById(id);
        return ResponseEntity.noContent().build();
    }
}
