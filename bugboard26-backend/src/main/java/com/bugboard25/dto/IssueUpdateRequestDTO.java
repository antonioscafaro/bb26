package com.bugboard25.dto;

import com.bugboard25.entity.enumerations.priorita_issue;
import com.bugboard25.entity.enumerations.stato_issue;
import com.bugboard25.entity.enumerations.tipo_issue;

public class IssueUpdateRequestDTO {
    private int id;
    private String titolo;
    private String descrizione;
    private tipo_issue tipoIssue;
    private stato_issue statoIssue;
    private priorita_issue prioritaIssue;
    private String assegnatario;
    private java.util.List<String> etichette;

    public java.util.List<String> getEtichette() {
        return etichette;
    }

    public void setEtichette(java.util.List<String> etichette) {
        this.etichette = etichette;
    }

    public int getId() {
        return id;
    }

    public stato_issue getStatoIssue() {
        return statoIssue;
    }

    public String getTitolo() {
        return titolo;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public tipo_issue getTipoIssue() {
        return tipoIssue;
    }

    public priorita_issue getPrioritaIssue() {
        return prioritaIssue;
    }

    public String getAssegnatario() {
        return assegnatario;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public void setTipoIssue(tipo_issue tipoIssue) {
        this.tipoIssue = tipoIssue;
    }

    public void setStatoIssue(stato_issue statoIssue) {
        this.statoIssue = statoIssue;
    }

    public void setPrioritaIssue(priorita_issue prioritaIssue) {
        this.prioritaIssue = prioritaIssue;
    }

    public void setAssegnatario(String assegnatario) {
        this.assegnatario = assegnatario;
    }
}
