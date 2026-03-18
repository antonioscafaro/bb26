package com.bugboard25.repository;

import com.bugboard25.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import com.bugboard25.entity.Commenti;

import java.util.List;

public interface CommentiRepository extends JpaRepository<Commenti, Integer> {
    public List<Commenti> findAllByIssue(Issue issue);

}
