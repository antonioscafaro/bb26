package com.bugboard25.dto;

public class EtichettaCreateRequestDTO {
    private String nome;
    private String colore;
    private int id;

    public String getNome() {
        return nome;
    }
    public String getColore() {
        return colore;
    }
    public int getId() {
        return id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
    public void setColore(String colore) {
        this.colore = colore;
    }
    public void setId(int id) {
        this.id = id;
    }
}
