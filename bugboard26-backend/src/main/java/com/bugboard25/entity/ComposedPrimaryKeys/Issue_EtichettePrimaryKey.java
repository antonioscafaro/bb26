package com.bugboard25.entity.ComposedPrimaryKeys;

import java.io.Serializable;
import java.util.Objects;

@jakarta.persistence.Embeddable
public class Issue_EtichettePrimaryKey implements Serializable {
    private int id_issue;
    private int id_etichetta;

    public Issue_EtichettePrimaryKey() {
    }

    public Issue_EtichettePrimaryKey(int id_issue, int id_etichetta) {
        this.id_issue = id_issue;
        this.id_etichetta = id_etichetta;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Issue_EtichettePrimaryKey)) return false;
        Issue_EtichettePrimaryKey that = (Issue_EtichettePrimaryKey) o;
        return Objects.equals(id_issue, that.id_issue) &&
                Objects.equals(id_etichetta, that.id_etichetta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_issue, id_etichetta);
    }

    public int getId_issue() {
        return id_issue;
    }

    public int getId_etichetta() {
        return id_etichetta;
    }
}
