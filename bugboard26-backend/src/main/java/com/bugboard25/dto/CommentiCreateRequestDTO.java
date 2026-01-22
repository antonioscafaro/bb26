package com.bugboard25.dto;

public class CommentiCreateRequestDTO {
    private String autore;
    private String testo;
    private int idIssue;

    public int getIdIssue() {
        return idIssue;
    }

    public void setIdIssue(int idIssue) {
        this.idIssue = idIssue;
    }

    public String getTesto() {
        return testo;
    }

    public String getAutore() {
        return autore;
    }

    public void setAutore(String autore) {
        this.autore = autore;
    }

    public void setTesto(String testo) {
        this.testo = testo;
    }
}
