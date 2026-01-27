package com.bugboard25.service;

import com.bugboard25.dto.ProgettiDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.service.UtentiService;
import com.bugboard25.dto.ProgettoCreateRequestDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Progetto_Membri;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.ComposedPrimaryKeys.Progetto_MembriPrimaryKey;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.Progetto_MembriRepository;
import com.bugboard25.repository.UtentiRepository;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.bugboard25.service.SseService;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProgettiService {
    @Autowired
    private ProgettiRepository progettiRepository;

    @Autowired
    private UtentiRepository utentiRepository;

    @Autowired
    private Progetto_MembriRepository progetto_MembriRepository;

    @Autowired
    private UtentiService utentiService;

    @Autowired
    private Progetto_MembriService progetto_MembriService;

    public List<ProgettiDTO> getProgettiByMembro(String utente) {
        return progettiRepository.findProgettiByMembroEmail(utente)
                .stream()
                .map(ProgettiDTO::new)
                .collect(Collectors.toList());
    }

    public List<ProgettiDTO> getProgetti(){
        return progettiRepository.findAll()
                .stream()
                .map(ProgettiDTO::new)
                .collect(Collectors.toList());
    }

    public ProgettiDTO getProgettiById(int id) {
        Optional<Progetti> progetti = progettiRepository.findById(id);
        if (progetti.isEmpty()){
            throw new RuntimeException("Progetto non trovato");
        }

        return new ProgettiDTO(progetti.get());
    }

    public List<ProgettiDTO> getProgettiByNome(String nome) {
        if (progettiRepository.existsByNome(nome)){
            return progettiRepository.findProgettiByNome(nome)
                    .stream()
                    .map(ProgettiDTO::new)
                    .collect(Collectors.toList());
        } else {
            throw new RuntimeException("Progetto non trovato");
        }
    }

    @Autowired
    private SseService sseService;

    private void notifyProjectMembers(int projectId) {
        try {
            // Find members to notify
            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                 List<Progetto_Membri> membri = progetto_MembriRepository.findByProgetto(progettoOpt.get());
                 for (Progetto_Membri membro : membri) {
                     sseService.sendUpdateSignal(membro.getUtente().getEmail(), "project-update");
                 }
            }
            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(tipo_ruolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                sseService.sendUpdateSignal(amministratore.getEmail(), "project-update");
            }
        } catch (Exception e) {
            System.err.println("Failed to broadcast project update: " + e.getMessage());
        }
    }

    public ProgettiDTO creaProgetto(ProgettoCreateRequestDTO requestDTO){
        Utenti creatore = utentiRepository.findById(requestDTO.getCreatore())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Progetti progetto = new Progetti();

        progetto.setNome(requestDTO.getNome());
        progetto.setDescrizione(requestDTO.getDescrizione());
        progetto.setData_creazione(new Date());
        progetto.setId_creatore(creatore);

        progetto = progettiRepository.save(progetto);

        // Add creator as member using service (handles notification)
        progetto_MembriService.associaUtente(progetto, creatore);

        // Notify isn't strictly necessary for creator (API response) but good for consistency 
        // if we have multiple tabs or lists open.
        notifyProjectMembers(progetto.getId()); 

        return new ProgettiDTO(progetto);
    }

    public ProgettiDTO updateProgettoById(int id, ProgettoCreateRequestDTO requestDTO){
        Progetti progetto = progettiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Progetto non trovato con ID: " + id));

        progetto.setNome(requestDTO.getNome());
        progetto.setDescrizione(requestDTO.getDescrizione());

        progetto = progettiRepository.save(progetto);
        notifyProjectMembers(progetto.getId());
        return new ProgettiDTO(progetto);
    }

    public void deleteProgettoById(int id){
        // Notify before deleting, otherwise we can't find members
        notifyProjectMembers(id);
        
        Progetti progettoDaEliminare = progettiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));
        progettiRepository.delete(progettoDaEliminare);
    }
}
