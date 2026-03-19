package com.bugboard25.service;

import com.bugboard25.dto.ProgettiDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.dto.ProgettoCreateRequestDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.ProgettoMembri;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.TipoRuolo;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.ProgettoMembriRepository;
import com.bugboard25.repository.UtentiRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProgettiService {

    private static final Logger logger = LoggerFactory.getLogger(ProgettiService.class);

    private final ProgettiRepository progettiRepository;
    private final UtentiRepository utentiRepository;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final UtentiService utentiService;
    private final ProgettoMembriService progettoMembriService;
    private final SseService sseService;

    public ProgettiService(ProgettiRepository progettiRepository, UtentiRepository utentiRepository,
                           ProgettoMembriRepository progettoMembriRepository, UtentiService utentiService,
                           ProgettoMembriService progettoMembriService, SseService sseService) {
        this.progettiRepository = progettiRepository;
        this.utentiRepository = utentiRepository;
        this.progettoMembriRepository = progettoMembriRepository;
        this.utentiService = utentiService;
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

    private void notifyProjectMembers(int projectId) {
        try {
            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                 List<ProgettoMembri> membri = progettoMembriRepository.findByProgetto(progettoOpt.get());
                 for (ProgettoMembri membro : membri) {
                     sseService.sendUpdateSignal(membro.getUtente().getEmail(), ErrorMessages.PROJECT_UPDATE);
                 }
            }
            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(TipoRuolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                sseService.sendUpdateSignal(amministratore.getEmail(), ErrorMessages.PROJECT_UPDATE);
            }
        } catch (Exception e) {
            logger.error("Failed to broadcast project update: {}", e.getMessage());
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
        notifyProjectMembers(progetto.getId());

        return new ProgettiDTO(progetto);
    }

    public ProgettiDTO updateProgettoById(int id, ProgettoCreateRequestDTO requestDTO) {
        Progetti progetto = progettiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO + " con ID: " + id));

        progetto.setNome(requestDTO.getNome());
        progetto.setDescrizione(requestDTO.getDescrizione());

        progetto = progettiRepository.save(progetto);
        notifyProjectMembers(progetto.getId());
        return new ProgettiDTO(progetto);
    }

    public void deleteProgettoById(int id) {
        Progetti progettoDaEliminare = progettiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        // Collect emails to notify BEFORE delete (cascade removes members)
        List<String> emailsDaNotificare = collectProjectEmails(id);

        progettiRepository.delete(progettoDaEliminare);

        // Notify AFTER delete to avoid SSE race condition
        notifyEmails(emailsDaNotificare);
    }

    /**
     * Collects all emails that need to be notified for a project update:
     * project members + all administrators.
     */
    private List<String> collectProjectEmails(int projectId) {
        java.util.Set<String> emails = new java.util.LinkedHashSet<>();
        try {
            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                List<ProgettoMembri> membri = progettoMembriRepository.findByProgetto(progettoOpt.get());
                for (ProgettoMembri membro : membri) {
                    emails.add(membro.getUtente().getEmail());
                }
            }
            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(TipoRuolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                emails.add(amministratore.getEmail());
            }
        } catch (Exception e) {
            logger.error("Failed to collect project emails: {}", e.getMessage());
        }
        return new java.util.ArrayList<>(emails);
    }

    private void notifyEmails(List<String> emails) {
        try {
            for (String email : emails) {
                sseService.sendUpdateSignal(email, ErrorMessages.PROJECT_UPDATE);
            }
        } catch (Exception e) {
            logger.error("Failed to send project update notifications: {}", e.getMessage());
        }
    }
}
