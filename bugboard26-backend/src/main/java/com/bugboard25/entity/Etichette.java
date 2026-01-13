package com.bugboard25.entity;

import jakarta.persistence.*;

@Entity
public class Etichette {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_progetto")
    private Progetti id_progetto;

    @Column(nullable = false, length = 50)
    private String nome;

    @Column(nullable = false, length = 7)
    private String colore;

    public void setId(int id) {
        this.id = id;
    }

    public void setId_progetto(Progetti id_progetto) {
        this.id_progetto = id_progetto;
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

    public Progetti getId_progetto() {
        return id_progetto;
    }

    public String getNome() {
        return nome;
    }
}
