package com.bugboard25.entity;

import com.bugboard25.entity.ComposedPrimaryKeys.IssueEtichettePrimaryKey;
import jakarta.persistence.*;

@Entity
@Table(name = "issue_etichette")
public class IssueEtichette {
    @EmbeddedId
    private IssueEtichettePrimaryKey id;

    @ManyToOne
    @MapsId("id_issue")
    @JoinColumn(name = "id_issue")
    private Issue issue;

    @ManyToOne
    @MapsId("id_etichetta")
    @JoinColumn(name = "id_etichetta")
    private Etichette etichetta;

    public void setId(IssueEtichettePrimaryKey id) {
        this.id = id;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public void setEtichetta(Etichette etichetta) {
        this.etichetta = etichetta;
    }

    public IssueEtichettePrimaryKey getId() {
        return id;
    }

    public Issue getIssue() {
        return issue;
    }

    public Etichette getEtichetta() {
        return etichetta;
    }
}
