package com.bugboard25.entity.ComposedPrimaryKeys;

import java.io.Serializable;
import java.util.Objects;

@jakarta.persistence.Embeddable
public class ProgettoMembriPrimaryKey implements Serializable {
    private int id_progetto;
    private String utente;

    public ProgettoMembriPrimaryKey() {
    }

    public ProgettoMembriPrimaryKey(int idProgetto, String utente) {
        this.id_progetto = idProgetto;
        this.utente = utente;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProgettoMembriPrimaryKey that)) return false;
        return Objects.equals(id_progetto, that.id_progetto) &&
                Objects.equals(utente, that.utente);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_progetto, utente);
    }

    public int getIdProgetto() {
        return id_progetto;
    }

    public String getIdUtente() {
        return utente;
    }
}
