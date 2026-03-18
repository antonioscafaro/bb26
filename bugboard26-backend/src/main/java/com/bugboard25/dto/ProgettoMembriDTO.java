package com.bugboard25.dto;

import com.bugboard25.entity.ProgettoMembri;

public class ProgettoMembriDTO {

    private ProgettiDTO progetto;
    private UtentiDTO utente;

    public ProgettoMembriDTO(ProgettoMembri associazione) {
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
