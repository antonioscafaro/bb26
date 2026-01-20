package com.bugboard25.dto;

import com.bugboard25.entity.Progetto_Membri;

public class Progetto_MembriDTO {

    private ProgettiDTO progetto;
    private UtentiDTO utente;

    public Progetto_MembriDTO(Progetto_Membri associazione) {
        if (associazione.getProgetto() != null) {
            this.progetto = new ProgettiDTO(associazione.getProgetto());
        }
        if (associazione.getUtente() != null) {
            this.utente = new UtentiDTO(associazione.getUtente());
        }
    }

    public ProgettiDTO getProgetto() {
        return progetto;
    }

    public UtentiDTO getUtente() {
        return utente;
    }
}