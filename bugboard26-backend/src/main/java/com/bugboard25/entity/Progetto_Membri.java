package com.bugboard25.entity;

import com.bugboard25.entity.ComposedPrimaryKeys.Progetto_MembriPrimaryKey;
import jakarta.persistence.*;

@Entity
public class Progetto_Membri {
    @EmbeddedId
    private Progetto_MembriPrimaryKey id;

    @ManyToOne
    @MapsId("id_progetto")
    @JoinColumn(name = "id_progetto")
    private Progetti progetto;

    @ManyToOne
    @MapsId("utente")
    @JoinColumn(name = "email_utente")
    private Utenti utente;

    public void setId(Progetto_MembriPrimaryKey id) {
        this.id = id;
    }

    public void setProgetto(Progetti progetto) {
        this.progetto = progetto;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public Progetto_MembriPrimaryKey getId() {
        return id;
    }

    public Progetti getProgetto() {
        return progetto;
    }

    public Utenti getUtente() {
        return utente;
    }
}
