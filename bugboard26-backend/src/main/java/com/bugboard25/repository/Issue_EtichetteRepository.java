package com.bugboard25.repository;

import com.bugboard25.entity.ComposedPrimaryKeys.Issue_EtichettePrimaryKey;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue_Etichette;
import com.bugboard25.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface Issue_EtichetteRepository extends JpaRepository<Issue_Etichette, Issue_EtichettePrimaryKey> {
    @Modifying
    @Transactional
    void deleteAllByIssue(Issue issue);
}
