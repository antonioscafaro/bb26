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

    public void setData_creazione(Date data_creazione) {
        this.data_creazione = data_creazione;
    }

    private String nome;
    private String descrizione;
    private UtentiDTO creatore;
    private Date data_creazione;

    public ProgettiDTO(Progetti progetto) {
        this.id = progetto.getId();
        this.nome = progetto.getNome();
        this.descrizione = progetto.getDescrizione();
        this.data_creazione = progetto.getData_creazione();

        if (progetto.getId_creatore() != null) {
            this.creatore = new UtentiDTO(progetto.getId_creatore());
        }
    }

    public int getId() { return id; }
    public String getNome() { return nome; }
    public String getDescrizione() { return descrizione; }
    public UtentiDTO getCreatore() { return creatore; }
    public Date getData_creazione() { return data_creazione; }
}