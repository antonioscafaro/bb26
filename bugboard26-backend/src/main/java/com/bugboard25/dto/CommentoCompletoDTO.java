package com.bugboard25.dto;

import com.bugboard25.entity.Commenti;

import java.util.Date;
import java.util.List;

public class CommentoCompletoDTO {
    private int id;
    private String testo;
    private Date dataCreazione;
    private AutoreCommentoDTO autore;
    private List<AutoreCommentoDTO> menzionati;

    public CommentoCompletoDTO(Commenti commento) {
        this.id = commento.getId();
        this.testo = commento.getTesto();
        this.dataCreazione = commento.getDataCreazione();
        this.autore = new AutoreCommentoDTO(commento.getAutore());
    }

    public CommentoCompletoDTO(Commenti commento, List<AutoreCommentoDTO> menzionati) {
        this.id = commento.getId();
        this.testo = commento.getTesto();
        this.dataCreazione = commento.getDataCreazione();
        this.autore = new AutoreCommentoDTO(commento.getAutore());
        this.menzionati = menzionati;
    }

    public AutoreCommentoDTO getAutore() {
        return autore;
    }

    public void setAutore(AutoreCommentoDTO autore) {
        this.autore = autore;
    }

    public Date getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(Date dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public String getTesto() {
        return testo;
    }

    public List<AutoreCommentoDTO> getMenzionati() {
        return menzionati;
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

    public void setMenzionati(List<AutoreCommentoDTO> menzionati) {
        this.menzionati = menzionati;
    }
}
