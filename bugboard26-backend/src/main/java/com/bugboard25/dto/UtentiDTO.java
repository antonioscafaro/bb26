package com.bugboard25.dto;

import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.tipo_ruolo;

public class UtentiDTO {
    private String email;
    private String nome;
    private String cognome;
    private tipo_ruolo ruolo;

    public UtentiDTO(Utenti utente) {
        this.email = utente.getEmail();
        this.nome = utente.getNome();
        this.cognome = utente.getCognome();
        this.ruolo = utente.getRuolo();
    }

    public String getEmail() { return email; }
    public String getNome() { return nome; }
    public String getCognome() { return cognome; }
    public tipo_ruolo getRuolo() { return ruolo; }
}