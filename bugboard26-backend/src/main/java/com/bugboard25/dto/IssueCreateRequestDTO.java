package com.bugboard25.dto;

import com.bugboard25.entity.Allegati;
import com.bugboard25.entity.enumerations.priorita_issue;
import com.bugboard25.entity.enumerations.tipo_issue;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class IssueCreateRequestDTO {
    private String titolo;
    private String descrizione;
    private tipo_issue tipoIssue;
    private priorita_issue prioritaIssue;
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

    public tipo_issue getTipoIssue() {
        return tipoIssue;
    }

    public priorita_issue getPrioritaIssue() {
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

    public void setTipoIssue(tipo_issue tipoIssue) {
        this.tipoIssue = tipoIssue;
    }

    public void setPrioritaIssue(priorita_issue prioritaIssue) {
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
