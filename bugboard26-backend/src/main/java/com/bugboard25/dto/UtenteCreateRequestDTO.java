package com.bugboard25.dto;

import com.bugboard25.entity.enumerations.tipo_ruolo;

public class UtenteCreateRequestDTO {
    private String email;
    private String password;
    private String nome;
    private String cognome;
    private tipo_ruolo ruolo;

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

    public tipo_ruolo getRuolo() {
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

    public void setRuolo(tipo_ruolo ruolo) {
        this.ruolo = ruolo;
    }
}
