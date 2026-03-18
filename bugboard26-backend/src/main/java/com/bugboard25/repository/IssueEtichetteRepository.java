package com.bugboard25.repository;

import com.bugboard25.entity.composedprimarykeys.IssueEtichettePrimaryKey;
import com.bugboard25.entity.IssueEtichette;
import com.bugboard25.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface IssueEtichetteRepository extends JpaRepository<IssueEtichette, IssueEtichettePrimaryKey> {
    @Modifying
    @Transactional
    void deleteAllByIssue(Issue issue);
}
