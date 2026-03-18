package com.bugboard25.service;

import com.bugboard25.dto.EtichettaCreateRequestDTO;
import com.bugboard25.dto.EtichettaDTO;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.EtichetteRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.ProgettiRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EtichetteService {

    private final EtichetteRepository etichetteRepository;
    private final ProgettiRepository progettiRepository;
    private final IssueRepository issueRepository;

    public EtichetteService(EtichetteRepository etichetteRepository, ProgettiRepository progettiRepository,
                            IssueRepository issueRepository) {
        this.etichetteRepository = etichetteRepository;
        this.progettiRepository = progettiRepository;
        this.issueRepository = issueRepository;
    }

    public List<EtichettaDTO> getAllEtichette() {
        return etichetteRepository.findAll()
                .stream()
                .map(EtichettaDTO::new)
                .toList();
    }

    public List<EtichettaDTO> getEtichetteByNome(String etichetta) {
        return etichetteRepository.findByNome(etichetta)
                .stream()
                .map(EtichettaDTO::new)
                .toList();
    }

    public List<EtichettaDTO> getEtichetteByProgetti(int progetto) {
        return etichetteRepository.findByProgettoIdQuery(progetto)
                .stream()
                .map(EtichettaDTO::new)
                .toList();
    }

    public List<EtichettaDTO> getEtichetteByIssue(int idIssue) {
        Issue issue = issueRepository.findById(idIssue)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_TROVATA));
        return etichetteRepository.findEtichetteByIssue(issue)
                .stream()
                .map(EtichettaDTO::new)
                .toList();
    }

    public EtichettaDTO creaEtichetta(EtichettaCreateRequestDTO requestDTO) {
        Progetti progetto = progettiRepository.findById(requestDTO.getId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));
        Etichette etichetta = new Etichette();

        etichetta.setIdProgetto(progetto);
        etichetta.setNome(requestDTO.getNome());
        etichetta.setColore(requestDTO.getColore());

        etichetta = etichetteRepository.save(etichetta);
        return new EtichettaDTO(etichetta);
    }

    public Etichette findOrCreate(String nomeEtichetta, Progetti progetto) {
        final String coloreDefault = "#CCCCCC";
        List<Etichette> etichetteTrovate = etichetteRepository.findByNome(nomeEtichetta);

        for (Etichette et : etichetteTrovate) {
            if (et.getIdProgetto().getId() == progetto.getId()) {
                return et;
            }
        }

        Etichette nuovaEtichetta = new Etichette();
        nuovaEtichetta.setNome(nomeEtichetta);
        nuovaEtichetta.setColore(coloreDefault);
        nuovaEtichetta.setIdProgetto(progetto);

        return etichetteRepository.save(nuovaEtichetta);
    }
}
