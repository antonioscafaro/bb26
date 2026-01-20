package com.bugboard25.dto;

public class Issue_EtichettaCreateRequestDTO {
    private int idIssue;
    private int idEtichetta;

    public void setIdIssue(int idIssue) {
        this.idIssue = idIssue;
    }

    public void setIdEtichetta(int idEtichetta) {
        this.idEtichetta = idEtichetta;
    }

    public int getIdIssue() {
        return idIssue;
    }

    public int getIdEtichetta() {
        return idEtichetta;
    }
}
