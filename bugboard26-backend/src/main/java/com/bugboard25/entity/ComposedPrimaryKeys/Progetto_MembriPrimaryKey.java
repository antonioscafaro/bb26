package com.bugboard25.entity.ComposedPrimaryKeys;

import java.io.Serializable;
import java.util.Objects;

@jakarta.persistence.Embeddable
public class Progetto_MembriPrimaryKey implements Serializable {
    private int id_progetto;
    private String utente;

    public Progetto_MembriPrimaryKey() {
    }

    public Progetto_MembriPrimaryKey(int id_progetto, String utente) {
        this.id_progetto = id_progetto;
        this.utente = utente;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Progetto_MembriPrimaryKey)) return false;
        Progetto_MembriPrimaryKey that = (Progetto_MembriPrimaryKey) o;
        return Objects.equals(id_progetto, that.id_progetto) &&
                Objects.equals(utente, that.utente);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_progetto, utente);
    }

    public int getId_progetto() {
        return id_progetto;
    }

    public String getId_utente() {
        return utente;
    }
}
