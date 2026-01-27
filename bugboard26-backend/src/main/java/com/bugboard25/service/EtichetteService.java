package com.bugboard25.service;

import com.bugboard25.dto.EtichettaCreateRequestDTO;
import com.bugboard25.dto.EtichettaDTO;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.repository.EtichetteRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.ProgettiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EtichetteService {

    @Autowired
    private EtichetteRepository etichetteRepository;

    @Autowired
    private ProgettiRepository progettiRepository;

    @Autowired
    private IssueRepository issueRepository;

    public List<EtichettaDTO> getAllEtichette(){
        return etichetteRepository.findAll()
                .stream()
                .map(EtichettaDTO::new)
                .collect(Collectors.toList());
    }

    public List<EtichettaDTO> getEtichetteByNome(String etichetta){
        return etichetteRepository.findByNome(etichetta)
                .stream()
                .map(EtichettaDTO::new)
                .collect(Collectors.toList());
    }

    public List<EtichettaDTO> getEtichetteByProgetti(int progetto) {
        return etichetteRepository.findByProgettoIdQuery(progetto)
                .stream()
                .map(EtichettaDTO::new)
                .collect(Collectors.toList());
    }

    public List<EtichettaDTO> getEtichetteByIssue(int idIssue){
        Issue issue = issueRepository.findById(idIssue)
                .orElseThrow(() -> new RuntimeException("Id issue not found"));
        return etichetteRepository.findEtichetteByIssue(issue)
                .stream()
                .map(EtichettaDTO::new)
                .collect(Collectors.toList());
    }

    public EtichettaDTO creaEtichetta(EtichettaCreateRequestDTO requestDTO){
        Progetti progetto = progettiRepository.findById(requestDTO.getId())
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));
        Etichette etichetta = new Etichette();

        etichetta.setId_progetto(progetto);
        etichetta.setNome(requestDTO.getNome());
        etichetta.setColore(requestDTO.getColore());

        etichetta = etichetteRepository.save(etichetta);
        return new EtichettaDTO(etichetta);
    }

    public Etichette findOrCreate(String nomeEtichetta, Progetti progetto) {
        final String COLORE_DEFAULT = "#CCCCCC";
        List<Etichette> etichetteTrovate = etichetteRepository.findByNome(nomeEtichetta);
        
        for (Etichette et : etichetteTrovate) {
            if (et.getId_progetto().getId() == progetto.getId()) {
                return et;
            }
        }

        Etichette nuovaEtichetta = new Etichette();
        nuovaEtichetta.setNome(nomeEtichetta);
        nuovaEtichetta.setColore(COLORE_DEFAULT);
        nuovaEtichetta.setId_progetto(progetto);

        return etichetteRepository.save(nuovaEtichetta);
    }
}
