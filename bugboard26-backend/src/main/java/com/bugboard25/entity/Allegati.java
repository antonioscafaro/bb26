package com.bugboard25.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Allegati {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_issue")
    private Issue issue;

    @Column(nullable = true, length = 1024, name = "url_file")
    private String urlFile;

    @Column(nullable = true, length = 255, name = "nome_file")
    private String nomeFile;

    @Column(nullable = true, length = 50, name = "tipo_file")
    private String tipoFile;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_caricamento")
    private Date dataCaricamento;

    public void setId(int id) {
        this.id = id;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public void setUrlFile(String urlFile) {
        this.urlFile = urlFile;
    }

    public void setNomeFile(String nomeFile) {
        this.nomeFile = nomeFile;
    }

    public void setTipoFile(String tipoFile) {
        this.tipoFile = tipoFile;
    }

    public void setDataCaricamento(Date dataCaricamento) {
        this.dataCaricamento = dataCaricamento;
    }

    public int getId() {
        return id;
    }

    public String getUrlFile() {
        return urlFile;
    }

    public String getNomeFile() {
        return nomeFile;
    }

    public String getTipoFile() {
        return tipoFile;
    }

    public Date getDataCaricamento() {
        return dataCaricamento;
    }

    public Issue getIssue() {
        return issue;
    }
}
