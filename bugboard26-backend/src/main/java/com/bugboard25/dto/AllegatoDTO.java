package com.bugboard25.dto;

import com.bugboard25.entity.Allegati;
import java.util.Date;

public class AllegatoDTO {
    private int id;
    private int idIssue;
    private String nomeFile;
    private String tipoFile;
    private Date dataCaricamento;

    public AllegatoDTO(Allegati allegato) {
        this.id = allegato.getId();
        this.nomeFile = allegato.getNomeFile();
        this.tipoFile = allegato.getTipoFile();
        this.dataCaricamento = allegato.getDataCaricamento();

        if (allegato.getIssue() != null) {
            this.idIssue = allegato.getIssue().getId();
        }
    }

    public int getId() { return id; }
    public int getIdIssue() { return idIssue; }
    public String getNomeFile() { return nomeFile; }
    public String getTipoFile() { return tipoFile; }
    public Date getDataCaricamento() { return dataCaricamento; }
}