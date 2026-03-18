package com.bugboard25.entity.composedprimarykeys;

import java.io.Serializable;
import java.util.Objects;

@jakarta.persistence.Embeddable
public class ProgettoMembriPrimaryKey implements Serializable {
    private int idProgetto;
    private String utente;

    public ProgettoMembriPrimaryKey() {
    }

    public ProgettoMembriPrimaryKey(int idProgetto, String utente) {
        this.idProgetto = idProgetto;
        this.utente = utente;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProgettoMembriPrimaryKey that)) return false;
        return Objects.equals(idProgetto, that.idProgetto) &&
                Objects.equals(utente, that.utente);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idProgetto, utente);
    }

    public int getIdProgetto() {
        return idProgetto;
    }

    public String getIdUtente() {
        return utente;
    }
}
