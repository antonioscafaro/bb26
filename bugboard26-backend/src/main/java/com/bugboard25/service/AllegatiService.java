package com.bugboard25.service;

import com.bugboard25.dto.AllegatoDTO;
import com.bugboard25.entity.Allegati;
import com.bugboard25.entity.Issue;
import com.bugboard25.exception.BadRequestException;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.AllegatiRepository;
import com.bugboard25.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AllegatiService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );


    private final AllegatiRepository allegatiRepository;
    private final IssueRepository issueRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public AllegatiService(AllegatiRepository allegatiRepository, IssueRepository issueRepository) {
        this.allegatiRepository = allegatiRepository;
        this.issueRepository = issueRepository;
    }

    public Allegati getAllegatoById(int id) {
        return allegatiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ALLEGATO_NON_TROVATO));
    }

    public AllegatoDTO salvaFile(MultipartFile file, Integer idIssue) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BadRequestException(ErrorMessages.TIPO_FILE_NON_CONSENTITO);
        }

        Issue issue = issueRepository.findById(idIssue)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA + " con id: " + idIssue));

        String nomeOriginale = file.getOriginalFilename();
        if (nomeOriginale == null || nomeOriginale.isBlank()) {
            throw new IllegalArgumentException("Il nome del file non può essere vuoto.");
        }

        // Sanitizza: rimuove qualsiasi componente di directory (previene path traversal)
        String nomeSanitizzato = Paths.get(nomeOriginale).getFileName().toString();
        String nomeFileUnico = UUID.randomUUID().toString() + "-" + nomeSanitizzato;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(nomeFileUnico).normalize();

        // Verifica che il file resti dentro la directory di upload
        if (!filePath.startsWith(uploadPath)) {
            throw new SecurityException("Tentativo di path traversal rilevato.");
        }

        Files.copy(file.getInputStream(), filePath);

        Allegati allegato = new Allegati();
        allegato.setIssue(issue);
        allegato.setNomeFile(nomeOriginale);
        allegato.setTipoFile(file.getContentType());
        allegato.setDataCaricamento(new Date());

        allegato.setUrlFile(nomeFileUnico);

        allegato = allegatiRepository.save(allegato);
        return new AllegatoDTO(allegato);
    }

    public Resource loadFileAsResource(String uniqueFileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(uniqueFileName).normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Impossibile leggere il file: " + uniqueFileName);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Errore nel percorso del file: " + uniqueFileName);
        }
    }

    public List<AllegatoDTO> getAllegatiByIssue(int idIssue) {
        Issue issue = issueRepository.findById(idIssue)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));

        return allegatiRepository.findAllegatiByIssue(issue)
                .stream()
                .map(AllegatoDTO::new)
                .toList();
    }
}
