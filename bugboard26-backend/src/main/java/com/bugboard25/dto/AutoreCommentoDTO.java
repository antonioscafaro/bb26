package com.bugboard25.dto;

import com.bugboard25.entity.Utenti;

public class AutoreCommentoDTO {
    private String nome;
    private String cognome;

    public AutoreCommentoDTO(Utenti autore) {
        this.nome = autore.getNome();
        this.cognome = autore.getCognome();
    }

    public String getNome() {
        return nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

}
