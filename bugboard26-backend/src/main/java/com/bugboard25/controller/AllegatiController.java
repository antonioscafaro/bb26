package com.bugboard25.controller;

import com.bugboard25.dto.AllegatoDTO;
import com.bugboard25.entity.Allegati;
import com.bugboard25.service.AllegatiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource; // Importante

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/allegati")
public class AllegatiController {

    @Autowired
    private AllegatiService allegatiService;

    @PostMapping("/{idIssue}")
    public ResponseEntity<AllegatoDTO> caricaAllegato(
            @PathVariable int idIssue,
            @RequestParam("file") MultipartFile file) {

        try {
            AllegatoDTO allegatoSalvato = allegatiService.salvaFile(file, idIssue);
            return ResponseEntity.status(HttpStatus.CREATED).body(allegatoSalvato);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/issue/{idIssue}")
    public ResponseEntity<List<AllegatoDTO>> getAllegatiPerIssue(@PathVariable int idIssue) {
        List<AllegatoDTO> allegati = allegatiService.getAllegatiByIssue(idIssue);
        return ResponseEntity.ok(allegati);
    }


    @GetMapping("/download/{idAllegato}")
    public ResponseEntity<Resource> scaricaAllegato(@PathVariable int idAllegato) {


        Allegati allegato = allegatiService.getAllegatoById(idAllegato); // Metodo ipotetico


        Resource resource = allegatiService.loadFileAsResource(allegato.getUrl_file()); // Metodo ipotetico

        String contentType = allegato.getTipo_file();
        if(contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream"; // Default
        }

        String headerValue = "attachment; filename=\"" + allegato.getNome_file() + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
    }

}