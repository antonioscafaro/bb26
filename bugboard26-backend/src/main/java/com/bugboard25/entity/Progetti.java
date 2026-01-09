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
    private Utenti id_creatore;

    @Temporal(TemporalType.TIMESTAMP)
    private Date data_creazione;

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

    public void setId_creatore(Utenti id_creatore) {
        this.id_creatore = id_creatore;
    }

    public void setData_creazione(Date data_creazione) {
        this.data_creazione = data_creazione;
    }

    public String getNome() {
        return nome;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public Utenti getId_creatore() {
        return id_creatore;
    }

    public Date getData_creazione() {
        return data_creazione;
    }
}
