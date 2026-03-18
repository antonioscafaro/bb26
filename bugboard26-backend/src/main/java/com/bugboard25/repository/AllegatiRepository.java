package com.bugboard25.repository;

import com.bugboard25.entity.Allegati;
import com.bugboard25.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllegatiRepository extends JpaRepository<Allegati, Integer> {
    public List<Allegati> findAllegatiByIssue(Issue issue);
}
