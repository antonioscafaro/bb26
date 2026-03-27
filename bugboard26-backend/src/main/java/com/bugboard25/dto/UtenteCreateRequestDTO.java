package com.bugboard25.dto;

import com.bugboard25.entity.enumerations.TipoRuolo;

public class UtenteCreateRequestDTO {
    private String emailCreante;
    private String email;
    private String password;
    private String nome;
    private String cognome;
    private TipoRuolo ruolo;

    public String getEmailCreante() {
        return emailCreante;
    }

    public void setEmailCreante(String emailCreante) {
        this.emailCreante = emailCreante;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getNome() {
        return nome;
    }

    public String getCognome() {
        return cognome;
    }

    public TipoRuolo getRuolo() {
        return ruolo;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public void setRuolo(TipoRuolo ruolo) {
        this.ruolo = ruolo;
    }
}
