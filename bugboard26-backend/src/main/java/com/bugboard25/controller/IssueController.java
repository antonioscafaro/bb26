package com.bugboard25.controller;

import com.bugboard25.dto.*;
import com.bugboard25.entity.enumerations.PrioritaIssue;
import com.bugboard25.entity.enumerations.StatoIssue;
import com.bugboard25.entity.enumerations.TipoIssue;
import com.bugboard25.service.CommentiService;
import com.bugboard25.service.EtichetteService;
import com.bugboard25.service.IssueService;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private static final String SORT_DATA_CREAZIONE = "dataCreazione";

    private final IssueService issueService;
    private final EtichetteService etichetteService;
    private final CommentiService commentiService;

    public IssueController(IssueService issueService, EtichetteService etichetteService,
                           CommentiService commentiService) {
        this.issueService = issueService;
        this.etichetteService = etichetteService;
        this.commentiService = commentiService;
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<IssueDTO> getIssueById(@PathVariable int id) {
        IssueDTO issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    @GetMapping("/stato/{statoIssue}")
    public ResponseEntity<List<IssueDTO>> getIssueByStato(@PathVariable StatoIssue statoIssue, java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, SORT_DATA_CREAZIONE);
        List<IssueDTO> issues = issueService.getIssueByStato(statoIssue, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/priorita/{prioritaIssue}")
    public ResponseEntity<List<IssueDTO>> getIssuePriorita(@PathVariable PrioritaIssue prioritaIssue, java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, SORT_DATA_CREAZIONE);
        List<IssueDTO> issues = issueService.getIssueByPriorita(prioritaIssue, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/tipo/{tipoIssue}")
    public ResponseEntity<List<IssueDTO>> getIssueByTipo(@PathVariable TipoIssue tipoIssue, java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, SORT_DATA_CREAZIONE);
        List<IssueDTO> issues = issueService.getIssueByTipo(tipoIssue, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("{idIssue}/etichette")
    public ResponseEntity<List<EtichettaDTO>> getEtichetteByIssue(@PathVariable int idIssue) {
        List<EtichettaDTO> etichette = etichetteService.getEtichetteByIssue(idIssue);
        return ResponseEntity.ok(etichette);
    }

    @GetMapping("by-data")
    public ResponseEntity<List<IssueDTO>> getIssueByData(
            @RequestParam("dataInizio") @DateTimeFormat(pattern = "dd-MM-yyyy") Date dataInizio,
            @RequestParam("dataFine") @DateTimeFormat(pattern = "dd-MM-yyyy") Date dataFine,
            java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, SORT_DATA_CREAZIONE);
        List<IssueDTO> issues = issueService.getIssueByData(dataInizio, dataFine, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{idIssue}/commenti")
    public ResponseEntity<List<CommentoCompletoDTO>> getCommentByIssue(@PathVariable int idIssue) {
        List<CommentoCompletoDTO> commenti = commentiService.getAllByIssue(idIssue);
        return ResponseEntity.ok(commenti);
    }

    @PostMapping
    public ResponseEntity<IssueDTO> createIssue(
            @RequestPart("issueData") IssueCreateRequestDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        IssueDTO nuovaIssue = issueService.creaIssue(dto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuovaIssue);
    }

    @PutMapping("/{idIssue}")
    public ResponseEntity<IssueDTO> updateIssue(@PathVariable int idIssue, @RequestBody IssueUpdateRequestDTO dto, java.security.Principal principal) {
        String emailRichiedente = principal.getName();
        IssueDTO issue = issueService.updateIssueById(idIssue, dto, emailRichiedente);
        return ResponseEntity.ok(issue);
    }

    @PutMapping("/archiviate/{idIssue}")
    public ResponseEntity<IssueDTO> archiveIssue(@PathVariable int idIssue) {
        IssueDTO issue = issueService.archiviaIssueById(idIssue);
        return ResponseEntity.ok(issue);
    }
}
