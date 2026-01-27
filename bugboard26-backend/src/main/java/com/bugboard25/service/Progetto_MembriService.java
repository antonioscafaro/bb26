package com.bugboard25.service;

import com.bugboard25.dto.Progetto_MembriCreateRequestDTO;
import com.bugboard25.dto.Progetto_MembriDTO;
import com.bugboard25.entity.ComposedPrimaryKeys.Progetto_MembriPrimaryKey;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Progetto_Membri;
import com.bugboard25.entity.Utenti;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.Progetto_MembriRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Progetto_MembriService {
    @Autowired
    private ProgettiRepository progettiRepository;

    @Autowired
    private UtentiRepository utentiRepository;

    @Autowired
    private Progetto_MembriRepository progetto_MembriRepository;

    @Autowired
    private com.bugboard25.service.NotificheService notificheService;

    public Progetto_MembriDTO associaUtenti(Progetto_MembriCreateRequestDTO dto) {
        Utenti utente = utentiRepository.findById(dto.getUtente())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Progetti progetto = progettiRepository.findById(dto.getIdProgetto())
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));

        Progetto_MembriPrimaryKey pk = new Progetto_MembriPrimaryKey(
                dto.getIdProgetto(),
                dto.getUtente()
        );

        Progetto_Membri progettoMembri = new Progetto_Membri();
        progettoMembri.setId(pk);
        progettoMembri.setProgetto(progetto);
        progettoMembri.setUtente(utente);

        progettoMembri = progetto_MembriRepository.save(progettoMembri);
        
        notificheService.creaNotificaProgetto(utente, "Sei stato aggiunto al progetto: " + progetto.getNome());
        
        return new Progetto_MembriDTO(progettoMembri);
    }
    public void rimuoviUtente(int idProgetto, String emailUtente) {
        Progetti progetto = progettiRepository.findById(idProgetto)
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));
        
        Utenti utente = utentiRepository.findById(emailUtente)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        Progetto_MembriPrimaryKey pk = new Progetto_MembriPrimaryKey(idProgetto, emailUtente);
        
        if (!progetto_MembriRepository.existsById(pk)) {
            throw new RuntimeException("L'utente non è membro di questo progetto");
        }

        progetto_MembriRepository.deleteById(pk);
    }

    public void associaUtente(Progetti progetto, Utenti utente) {
        Progetto_MembriPrimaryKey pk = new Progetto_MembriPrimaryKey(progetto.getId(), utente.getEmail());

        Progetto_Membri progettoMembri = new Progetto_Membri();
        progettoMembri.setId(pk);
        progettoMembri.setProgetto(progetto);
        progettoMembri.setUtente(utente);

        progetto_MembriRepository.save(progettoMembri);
        
        notificheService.creaNotificaProgetto(utente, "Sei stato aggiunto al progetto: " + progetto.getNome());
    }
}
