package com.bugboard25.entity;

import com.bugboard25.entity.enumerations.tipo_ruolo;
import jakarta.persistence.*;
import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Utenti {
    @Id
    private String email;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100)
    private String cognome;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private tipo_ruolo ruolo;

    @Temporal(TemporalType.TIMESTAMP)
    private Date data_creazione;

    public void setEmail(String email) {
        this.email = email;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setRuolo(tipo_ruolo ruolo) {
        this.ruolo = ruolo;
    }

    public void setData_creazione(Date data_creazione) {
        this.data_creazione = data_creazione;
    }

    public String getEmail() {
        return email;
    }

    public String getNome() {
        return nome;
    }

    public String getCognome() {
        return cognome;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public tipo_ruolo getRuolo() {
        return ruolo;
    }

    public Date getData_creazione() {
        return data_creazione;
    }
}
