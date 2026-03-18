package com.bugboard25.entity;

import jakarta.persistence.*;

@Entity
public class Etichette {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_progetto")
    private Progetti idProgetto;

    @Column(nullable = false, length = 50)
    private String nome;

    @Column(nullable = false, length = 7)
    private String colore;

    public void setId(int id) {
        this.id = id;
    }

    public void setIdProgetto(Progetti idProgetto) {
        this.idProgetto = idProgetto;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setColore(String colore) {
        this.colore = colore;
    }

    public int getId() {
        return id;
    }

    public String getColore() {
        return colore;
    }

    public Progetti getIdProgetto() {
        return idProgetto;
    }

    public String getNome() {
        return nome;
    }
}
