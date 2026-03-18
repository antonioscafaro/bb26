package com.bugboard25.service;

import com.bugboard25.dto.ProgettoMembriCreateRequestDTO;
import com.bugboard25.dto.ProgettoMembriDTO;
import com.bugboard25.entity.composedprimarykeys.ProgettoMembriPrimaryKey;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.ProgettoMembri;
import com.bugboard25.entity.Utenti;
import com.bugboard25.exception.BadRequestException;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.ProgettoMembriRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.stereotype.Service;

@Service
public class ProgettoMembriService {

    private final ProgettiRepository progettiRepository;
    private final UtentiRepository utentiRepository;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final NotificheService notificheService;

    public ProgettoMembriService(ProgettiRepository progettiRepository, UtentiRepository utentiRepository,
                                 ProgettoMembriRepository progettoMembriRepository,
                                 NotificheService notificheService) {
        this.progettiRepository = progettiRepository;
        this.utentiRepository = utentiRepository;
        this.progettoMembriRepository = progettoMembriRepository;
        this.notificheService = notificheService;
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
}
