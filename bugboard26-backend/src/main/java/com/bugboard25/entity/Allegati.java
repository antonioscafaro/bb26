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

    @Column(nullable = true, length = 1024)
    private String url_file;

    @Column(nullable = true, length = 255)
    private String nome_file;

    @Column(nullable = true, length = 50)
    private String tipo_file;

    @Temporal(TemporalType.TIMESTAMP)
    private Date data_caricamento;

    public void setId(int id) {
        this.id = id;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public void setUrl_file(String url_file) {
        this.url_file = url_file;
    }

    public void setNome_file(String nome_file) {
        this.nome_file = nome_file;
    }

    public void setTipo_file(String tipo_file) {
        this.tipo_file = tipo_file;
    }

    public void setData_caricamento(Date data_caricamento) {
        this.data_caricamento = data_caricamento;
    }

    public int getId() {
        return id;
    }

    public String getUrl_file() {
        return url_file;
    }

    public String getNome_file() {
        return nome_file;
    }

    public String getTipo_file() {
        return tipo_file;
    }

    public Date getData_caricamento() {
        return data_caricamento;
    }

    public Issue getIssue() {
        return issue;
    }
}
