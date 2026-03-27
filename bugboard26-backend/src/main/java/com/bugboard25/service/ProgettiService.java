package com.bugboard25.service;

import com.bugboard25.dto.ProgettiDTO;
import com.bugboard25.dto.ProgettoCreateRequestDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.UtentiRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProgettiService {

    private final ProgettiRepository progettiRepository;
    private final UtentiRepository utentiRepository;
    private final ProgettoMembriService progettoMembriService;
    private final SseService sseService;

    public ProgettiService(ProgettiRepository progettiRepository, UtentiRepository utentiRepository,
            ProgettoMembriService progettoMembriService, SseService sseService) {
        this.progettiRepository = progettiRepository;
        this.utentiRepository = utentiRepository;
        this.progettoMembriService = progettoMembriService;
        this.sseService = sseService;
    }

    public List<ProgettiDTO> getProgettiByMembro(String utente) {
        return progettiRepository.findProgettiByMembroEmail(utente)
                .stream()
                .map(ProgettiDTO::new)
                .toList();
    }

    public List<ProgettiDTO> getProgetti() {
        return progettiRepository.findAll()
                .stream()
                .map(ProgettiDTO::new)
                .toList();
    }

    public ProgettiDTO getProgettiById(int id) {
        Progetti progetto = progettiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));
        return new ProgettiDTO(progetto);
    }

    public List<ProgettiDTO> getProgettiByNome(String nome) {
        if (progettiRepository.existsByNome(nome)) {
            return progettiRepository.findProgettiByNome(nome)
                    .stream()
                    .map(ProgettiDTO::new)
                    .toList();
        } else {
            throw new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO);
        }
    }

    public ProgettiDTO creaProgetto(ProgettoCreateRequestDTO requestDTO) {
        Utenti creatore = utentiRepository.findById(requestDTO.getCreatore())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        Progetti progetto = new Progetti();
        progetto.setNome(requestDTO.getNome());
        progetto.setDescrizione(requestDTO.getDescrizione());
        progetto.setDataCreazione(new Date());
        progetto.setIdCreatore(creatore);

        progetto = progettiRepository.save(progetto);

        progettoMembriService.associaUtente(progetto, creatore);
        sseService.notifyProjectMembers(progetto.getId(), ErrorMessages.PROJECT_UPDATE);

        return new ProgettiDTO(progetto);
    }

    public ProgettiDTO updateProgettoById(int id, ProgettoCreateRequestDTO requestDTO) {
        Progetti progetto = progettiRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO + " con ID: " + id));

        progetto.setNome(requestDTO.getNome());
        progetto.setDescrizione(requestDTO.getDescrizione());

        progetto = progettiRepository.save(progetto);
        sseService.notifyProjectMembers(progetto.getId(), ErrorMessages.PROJECT_UPDATE);
        return new ProgettiDTO(progetto);
    }

    @Transactional
    public void deleteProgettoById(int id) {
        Progetti progettoDaEliminare = progettiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        // Collect emails to notify BEFORE delete (cascade removes members)
        java.util.Set<String> emailsDaNotificare = sseService.collectProjectEmails(id);

        progettiRepository.delete(progettoDaEliminare);

        // Notify AFTER delete to avoid SSE race condition
        sseService.notifyEmails(emailsDaNotificare, ErrorMessages.PROJECT_UPDATE);
    }
}
