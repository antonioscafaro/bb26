package com.bugboard25.dto;

import com.bugboard25.entity.Utenti;

public class AutoreCommentoDTO {
    private String email;
    private String nome;
    private String cognome;

    public AutoreCommentoDTO(Utenti autore) {
        this.email = autore.getEmail();
        this.nome = autore.getNome();
        this.cognome = autore.getCognome();
    }

    public String getEmail() {
        return email;
    }

    public String getNome() {
        return nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

}
