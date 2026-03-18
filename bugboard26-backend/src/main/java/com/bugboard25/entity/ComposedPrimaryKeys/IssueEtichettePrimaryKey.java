package com.bugboard25.entity.ComposedPrimaryKeys;

import java.io.Serializable;
import java.util.Objects;

@jakarta.persistence.Embeddable
public class IssueEtichettePrimaryKey implements Serializable {
    private int id_issue;
    private int id_etichetta;

    public IssueEtichettePrimaryKey() {
    }

    public IssueEtichettePrimaryKey(int idIssue, int idEtichetta) {
        this.id_issue = idIssue;
        this.id_etichetta = idEtichetta;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof IssueEtichettePrimaryKey that)) return false;
        return Objects.equals(id_issue, that.id_issue) &&
                Objects.equals(id_etichetta, that.id_etichetta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_issue, id_etichetta);
    }

    public int getIdIssue() {
        return id_issue;
    }

    public int getIdEtichetta() {
        return id_etichetta;
    }
}
