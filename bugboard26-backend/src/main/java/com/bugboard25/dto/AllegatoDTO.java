package com.bugboard25.dto;

import com.bugboard25.entity.Allegati;
import java.util.Date;

public class AllegatoDTO {
    private int id;
    private int idIssue;
    private String nome_file;
    private String tipo_file;
    private Date data_caricamento;

    public AllegatoDTO(Allegati allegato) {
        this.id = allegato.getId();
        this.nome_file = allegato.getNome_file();
        this.tipo_file = allegato.getTipo_file();
        this.data_caricamento = allegato.getData_caricamento();

        if (allegato.getIssue() != null) {
            this.idIssue = allegato.getIssue().getId();
        }
    }

    public int getId() { return id; }
    public int getIdIssue() { return idIssue; }
    public String getNome_file() { return nome_file; }
    public String getTipo_file() { return tipo_file; }
    public Date getData_caricamento() { return data_caricamento; }
}