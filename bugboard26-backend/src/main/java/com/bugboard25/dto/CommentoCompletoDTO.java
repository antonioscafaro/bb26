package com.bugboard25.dto;

import com.bugboard25.entity.Commenti;

import java.util.Date;

public class CommentoCompletoDTO {
    private int id;
    private String testo;
    private Date data_creazione;
    private AutoreCommentoDTO autore;

    public CommentoCompletoDTO(Commenti commento) {
        this.id = commento.getId();
        this.testo = commento.getTesto();
        this.data_creazione = commento.getData_creazione();
        this.autore = new AutoreCommentoDTO(commento.getAutore());
    }

    public AutoreCommentoDTO getAutore() {
        return autore;
    }

    public void setAutore(AutoreCommentoDTO autore) {
        this.autore = autore;
    }

    public Date getData_creazione() {
        return data_creazione;
    }

    public void setData_creazione(Date data_creazione) {
        this.data_creazione = data_creazione;
    }

    public String getTesto() {
        return testo;
    }

    public void setTesto(String testo) {
        this.testo = testo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }


}
