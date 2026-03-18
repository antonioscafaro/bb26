package com.bugboard25.dto;

import com.bugboard25.entity.Progetti;
import java.util.Date;

public class ProgettiDTO {
    private int id;

    public void setId(int id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public void setCreatore(UtentiDTO creatore) {
        this.creatore = creatore;
    }

    public void setDataCreazione(Date dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    private String nome;
    private String descrizione;
    private UtentiDTO creatore;
    private Date dataCreazione;

    public ProgettiDTO(Progetti progetto) {
        this.id = progetto.getId();
        this.nome = progetto.getNome();
        this.descrizione = progetto.getDescrizione();
        this.dataCreazione = progetto.getDataCreazione();

        if (progetto.getIdCreatore() != null) {
            this.creatore = new UtentiDTO(progetto.getIdCreatore());
        }
    }

    public int getId() { return id; }
    public String getNome() { return nome; }
    public String getDescrizione() { return descrizione; }
    public UtentiDTO getCreatore() { return creatore; }
    public Date getDataCreazione() { return dataCreazione; }
}