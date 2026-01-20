package com.bugboard25.dto;

public class ProgettoCreateRequestDTO {
    private String nome;
    private String descrizione;
    private String creatore;

    public String getNome() {
        return nome;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public String getCreatore() {
        return creatore;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public void setCreatore(String creatore) {
        this.creatore = creatore;
    }
}
