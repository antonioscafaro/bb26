package com.bugboard25.dto;

import com.bugboard25.entity.enumerations.PrioritaIssue;
import com.bugboard25.entity.enumerations.TipoIssue;

import java.util.List;

public class IssueCreateRequestDTO {
    private String titolo;
    private String descrizione;
    private TipoIssue tipoIssue;
    private PrioritaIssue prioritaIssue;
    private String emailAutore;
    private int idProgetto;
    private List<String> etichette;

    public String getTitolo() {
        return titolo;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public int getIdProgetto() {
        return idProgetto;
    }

    public TipoIssue getTipoIssue() {
        return tipoIssue;
    }

    public PrioritaIssue getPrioritaIssue() {
        return prioritaIssue;
    }

    public String getEmailAutore() {
        return emailAutore;
    }

    public List<String> getEtichette() {
        return etichette;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public void setTipoIssue(TipoIssue tipoIssue) {
        this.tipoIssue = tipoIssue;
    }

    public void setPrioritaIssue(PrioritaIssue prioritaIssue) {
        this.prioritaIssue = prioritaIssue;
    }

    public void setEmailAutore(String emailAutore) {
        this.emailAutore = emailAutore;
    }

    public void setIdProgetto(int idProgetto) {
        this.idProgetto = idProgetto;
    }

    public void setEtichette(List<String> etichette) {
        this.etichette = etichette;
    }
}
