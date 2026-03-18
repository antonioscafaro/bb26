package com.bugboard25.dto;

public class IssueEtichettaCreateRequestDTO {
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
