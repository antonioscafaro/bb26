package com.bugboard25.controller;


import com.bugboard25.dto.CommentiCreateRequestDTO;
import com.bugboard25.dto.CommentoCompletoDTO;
import com.bugboard25.entity.Commenti;
import com.bugboard25.service.CommentiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/commenti")
public class CommentiController {
    @Autowired
    private CommentiService commentiService;

    @PostMapping
    public ResponseEntity<CommentoCompletoDTO> createCommenti(@RequestBody CommentiCreateRequestDTO dto) {
        CommentoCompletoDTO commento = commentiService.creaCommento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(commento);
    }
}
