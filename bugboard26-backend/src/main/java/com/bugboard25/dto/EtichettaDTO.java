package com.bugboard25.dto;

import com.bugboard25.entity.Etichette;

public class EtichettaDTO {
    private int id;
    private int idProgetto;
    private String nome;
    private String colore;

    public EtichettaDTO(Etichette etichetta) {
        this.id = etichetta.getId();
        this.nome = etichetta.getNome();
        this.colore = etichetta.getColore();

        if (etichetta.getId_progetto() != null) {
            this.idProgetto = etichetta.getId_progetto().getId();
        }
    }

    public int getId() { return id; }
    public int getIdProgetto() { return idProgetto; }
    public String getNome() { return nome; }
    public String getColore() { return colore; }
}