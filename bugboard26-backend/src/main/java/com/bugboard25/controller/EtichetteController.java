package com.bugboard25.controller;

import com.bugboard25.dto.EtichettaCreateRequestDTO;
import com.bugboard25.dto.EtichettaDTO;
import com.bugboard25.dto.IssueDTO;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.service.EtichetteService;
import com.bugboard25.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etichette")
public class EtichetteController {

    @Autowired
    private EtichetteService etichetteService;

    @Autowired
    private IssueService issueService;

    @GetMapping
    public ResponseEntity<List<EtichettaDTO>> getAllEtichette() {
        List<EtichettaDTO> etichette = etichetteService.getAllEtichette();
        return ResponseEntity.ok(etichette);
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<EtichettaDTO>> getAllEtichetteByNome(@PathVariable String nome) {
        List<EtichettaDTO> etichette = etichetteService.getEtichetteByNome(nome);
        return ResponseEntity.ok(etichette);
    }

    @GetMapping("/{idEtichetta}/issues")
    public ResponseEntity<List<IssueDTO>> getIssuesByEtichetta(@PathVariable int idEtichetta, java.security.Principal principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, "dataCreazione");
        List<IssueDTO> issues = issueService.getIssueByEtichetta(idEtichetta, principal.getName(), sort);
        return ResponseEntity.ok(issues);
    }

    @PostMapping
    public ResponseEntity<EtichettaDTO> createEtichette(@RequestBody EtichettaCreateRequestDTO dto) {
        EtichettaDTO etichetta = etichetteService.creaEtichetta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(etichetta);
    }
}
