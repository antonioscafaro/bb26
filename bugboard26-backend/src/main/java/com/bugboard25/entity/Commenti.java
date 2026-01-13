package com.bugboard25.entity;

import jakarta.persistence.*;
import java.util.Date;
import jakarta.persistence.GeneratedValue;

@Entity
public class Commenti {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_issue")
    private Issue issue;

    @ManyToOne
    @JoinColumn(name = "email_autore")
    private Utenti autore;

    @Column(nullable = false)
    private String testo;

    @Temporal(TemporalType.TIMESTAMP)
    private Date data_creazione;

    public void setId(int id) {
        this.id = id;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public void setAutore(Utenti autore) {
        this.autore = autore;
    }

    public void setTesto(String testo) {
        this.testo = testo;
    }

    public void setData_creazione(Date data_creazione) {
        this.data_creazione = data_creazione;
    }

    public Issue getIssue() {
        return issue;
    }

    public int getId() {
        return id;
    }

    public Utenti getAutore() {
        return autore;
    }

    public String getTesto() {
        return testo;
    }

    public Date getData_creazione() {
        return data_creazione;
    }
}
