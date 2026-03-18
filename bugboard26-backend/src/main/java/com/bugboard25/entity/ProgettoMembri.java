package com.bugboard25.entity;

import com.bugboard25.entity.ComposedPrimaryKeys.ProgettoMembriPrimaryKey;
import jakarta.persistence.*;

@Entity
@Table(name = "progetto_membri")
public class ProgettoMembri {
    @EmbeddedId
    private ProgettoMembriPrimaryKey id;

    @ManyToOne
    @MapsId("idProgetto")
    @JoinColumn(name = "id_progetto")
    private Progetti progetto;

    @ManyToOne
    @MapsId("utente")
    @JoinColumn(name = "email_utente")
    private Utenti utente;

    public void setId(ProgettoMembriPrimaryKey id) {
        this.id = id;
    }

    public void setProgetto(Progetti progetto) {
        this.progetto = progetto;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public ProgettoMembriPrimaryKey getId() {
        return id;
    }

    public Progetti getProgetto() {
        return progetto;
    }

    public Utenti getUtente() {
        return utente;
    }
}
