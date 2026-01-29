package com.bugboard25.service;

import com.bugboard25.dto.AllegatoDTO;
import com.bugboard25.entity.Allegati;
import com.bugboard25.entity.Issue;
import com.bugboard25.repository.AllegatiRepository;
import com.bugboard25.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AllegatiService {
    @Autowired
    private AllegatiRepository allegatiRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Allegati getAllegatoById(int id) {
        Allegati allegato = allegatiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Allegato non trovato"));
        return allegato;
    }

    public AllegatoDTO salvaFile(MultipartFile file, Integer idIssue) throws IOException {
        Issue issue = issueRepository.findById(idIssue)
                .orElseThrow(() -> new RuntimeException("Issue non trovata con id: " + idIssue));

        String nomeOriginale = file.getOriginalFilename();
        String nomeFileUnico = UUID.randomUUID().toString() + "-" + nomeOriginale;

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(nomeFileUnico);
        Files.copy(file.getInputStream(), filePath);

        Allegati allegato = new Allegati();
        allegato.setIssue(issue);
        allegato.setNome_file(nomeOriginale);
        allegato.setTipo_file(file.getContentType());
        allegato.setData_caricamento(new Date());

        allegato.setUrl_file(nomeFileUnico);

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
                throw new RuntimeException("Impossibile leggere il file: " + uniqueFileName);
            }
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new RuntimeException("Errore nel percorso del file: " + uniqueFileName, e);
        }
    }

    public List<AllegatoDTO> getAllegatiByIssue(int idIssue){
        Issue issue = issueRepository.findById(idIssue)
                .orElseThrow(() -> new RuntimeException("Issue non trovata con"));

        return allegatiRepository.findAllegatiByIssue(issue)
                .stream()
                .map(AllegatoDTO::new)
                .collect(Collectors.toList());
    }
}
