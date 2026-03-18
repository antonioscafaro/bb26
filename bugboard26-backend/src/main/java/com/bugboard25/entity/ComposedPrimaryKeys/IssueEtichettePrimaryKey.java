package com.bugboard25.entity.ComposedPrimaryKeys;

import java.io.Serializable;
import java.util.Objects;

@jakarta.persistence.Embeddable
public class IssueEtichettePrimaryKey implements Serializable {
    private int idIssue;
    private int idEtichetta;

    public IssueEtichettePrimaryKey() {
    }

    public IssueEtichettePrimaryKey(int idIssue, int idEtichetta) {
        this.idIssue = idIssue;
        this.idEtichetta = idEtichetta;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof IssueEtichettePrimaryKey that)) return false;
        return Objects.equals(idIssue, that.idIssue) &&
                Objects.equals(idEtichetta, that.idEtichetta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idIssue, idEtichetta);
    }

    public int getIdIssue() {
        return idIssue;
    }

    public int getIdEtichetta() {
        return idEtichetta;
    }
}
