package com.bugboard25.dto;

import com.bugboard25.entity.enumerations.PrioritaIssue;
import com.bugboard25.entity.enumerations.StatoIssue;
import com.bugboard25.entity.enumerations.TipoIssue;

public class IssueUpdateRequestDTO {
    private int id;
    private String titolo;
    private String descrizione;
    private TipoIssue tipoIssue;
    private StatoIssue statoIssue;
    private PrioritaIssue prioritaIssue;
    private String assegnatario;
    private java.util.List<EtichettaCreateRequestDTO> etichette;

    public java.util.List<EtichettaCreateRequestDTO> getEtichette() {
        return etichette;
    }

    public void setEtichette(java.util.List<EtichettaCreateRequestDTO> etichette) {
        this.etichette = etichette;
    }

    public int getId() {
        return id;
    }

    public StatoIssue getStatoIssue() {
        return statoIssue;
    }

    public String getTitolo() {
        return titolo;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public TipoIssue getTipoIssue() {
        return tipoIssue;
    }

    public PrioritaIssue getPrioritaIssue() {
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

    public void setTipoIssue(TipoIssue tipoIssue) {
        this.tipoIssue = tipoIssue;
    }

    public void setStatoIssue(StatoIssue statoIssue) {
        this.statoIssue = statoIssue;
    }

    public void setPrioritaIssue(PrioritaIssue prioritaIssue) {
        this.prioritaIssue = prioritaIssue;
    }

    public void setAssegnatario(String assegnatario) {
        this.assegnatario = assegnatario;
    }
}
