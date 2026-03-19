package com.bugboard25.service;

import com.bugboard25.dto.ProgettoMembriCreateRequestDTO;
import com.bugboard25.dto.ProgettoMembriDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.entity.composedprimarykeys.ProgettoMembriPrimaryKey;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.ProgettoMembri;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.TipoRuolo;
import com.bugboard25.exception.BadRequestException;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.ProgettoMembriRepository;
import com.bugboard25.repository.UtentiRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgettoMembriService {

    private static final Logger logger = LoggerFactory.getLogger(ProgettoMembriService.class);

    private final ProgettiRepository progettiRepository;
    private final UtentiRepository utentiRepository;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final NotificheService notificheService;
    private final SseService sseService;
    private final UtentiService utentiService;

    public ProgettoMembriService(ProgettiRepository progettiRepository, UtentiRepository utentiRepository,
                                 ProgettoMembriRepository progettoMembriRepository,
                                 NotificheService notificheService, SseService sseService,
                                 UtentiService utentiService) {
        this.progettiRepository = progettiRepository;
        this.utentiRepository = utentiRepository;
        this.progettoMembriRepository = progettoMembriRepository;
        this.notificheService = notificheService;
        this.sseService = sseService;
        this.utentiService = utentiService;
    }

    public ProgettoMembriDTO associaUtenti(ProgettoMembriCreateRequestDTO dto) {
        Utenti utente = utentiRepository.findById(dto.getUtente())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        Progetti progetto = progettiRepository.findById(dto.getIdProgetto())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        ProgettoMembriPrimaryKey pk = new ProgettoMembriPrimaryKey(
                dto.getIdProgetto(),
                dto.getUtente()
        );

        ProgettoMembri progettoMembri = new ProgettoMembri();
        progettoMembri.setId(pk);
        progettoMembri.setProgetto(progetto);
        progettoMembri.setUtente(utente);

        progettoMembri = progettoMembriRepository.save(progettoMembri);

        notificheService.creaNotificaProgetto(utente, "Sei stato aggiunto al progetto: " + progetto.getNome());
        notifyMembershipChange(progetto.getId(), utente.getEmail());

        return new ProgettoMembriDTO(progettoMembri);
    }

    public void rimuoviUtente(int idProgetto, String emailUtente) {
        progettiRepository.findById(idProgetto)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        utentiRepository.findById(emailUtente)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        ProgettoMembriPrimaryKey pk = new ProgettoMembriPrimaryKey(idProgetto, emailUtente);

        if (!progettoMembriRepository.existsById(pk)) {
            throw new BadRequestException("L'utente non è membro di questo progetto");
        }

        progettoMembriRepository.deleteById(pk);
        notifyMembershipChange(idProgetto, emailUtente);
    }

    public void associaUtente(Progetti progetto, Utenti utente) {
        ProgettoMembriPrimaryKey pk = new ProgettoMembriPrimaryKey(progetto.getId(), utente.getEmail());

        ProgettoMembri progettoMembri = new ProgettoMembri();
        progettoMembri.setId(pk);
        progettoMembri.setProgetto(progetto);
        progettoMembri.setUtente(utente);

        progettoMembriRepository.save(progettoMembri);

        notificheService.creaNotificaProgetto(utente, "Sei stato aggiunto al progetto: " + progetto.getNome());
    }

    /**
     * Notifies all project members, the affected user, and admins
     * about a membership change via SSE.
     */
    private void notifyMembershipChange(int projectId, String affectedEmail) {
        try {
            // Notify current project members
            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                List<ProgettoMembri> membri = progettoMembriRepository.findByProgetto(progettoOpt.get());
                for (ProgettoMembri membro : membri) {
                    sseService.sendUpdateSignal(membro.getUtente().getEmail(), ErrorMessages.PROJECT_UPDATE);
                }
            }
            // Notify the affected user directly (they may have just been removed
            // and won't be found in the member list above)
            sseService.sendUpdateSignal(affectedEmail, ErrorMessages.PROJECT_UPDATE);

            // Notify admins
            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(TipoRuolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                sseService.sendUpdateSignal(amministratore.getEmail(), ErrorMessages.PROJECT_UPDATE);
            }
        } catch (Exception e) {
            logger.error("Failed to broadcast membership change: {}", e.getMessage());
        }
    }
}

