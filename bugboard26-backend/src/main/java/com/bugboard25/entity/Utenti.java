package com.bugboard25.entity;

import com.bugboard25.entity.enumerations.TipoRuolo;
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
    private TipoRuolo ruolo;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_creazione")
    private Date dataCreazione;

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

    public void setRuolo(TipoRuolo ruolo) {
        this.ruolo = ruolo;
    }

    public void setDataCreazione(Date dataCreazione) {
        this.dataCreazione = dataCreazione;
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

    public TipoRuolo getRuolo() {
        return ruolo;
    }

    public Date getDataCreazione() {
        return dataCreazione;
    }
}
