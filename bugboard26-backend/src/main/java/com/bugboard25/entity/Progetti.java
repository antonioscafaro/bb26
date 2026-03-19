package com.bugboard25.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Progetti {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(length = 255, nullable = false, unique = true)
    private String nome;

    @Column
    private String descrizione;

    @ManyToOne
    @JoinColumn(name = "id_creatore")
    private Utenti idCreatore;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_creazione")
    private Date dataCreazione;

    @OneToMany(mappedBy = "idProgetto", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Issue> issues;

    @OneToMany(mappedBy = "progetto", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ProgettoMembri> membri;

    @OneToMany(mappedBy = "idProgetto", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Etichette> etichette;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public void setIdCreatore(Utenti idCreatore) {
        this.idCreatore = idCreatore;
    }

    public void setDataCreazione(Date dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public String getNome() {
        return nome;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public Utenti getIdCreatore() {
        return idCreatore;
    }

    public Date getDataCreazione() {
        return dataCreazione;
    }
}
