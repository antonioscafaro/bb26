package com.bugboard25.repository;

import com.bugboard25.entity.ComposedPrimaryKeys.Progetto_MembriPrimaryKey;
import com.bugboard25.entity.Progetto_Membri;
import com.bugboard25.entity.Progetti;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface Progetto_MembriRepository extends JpaRepository<Progetto_Membri, Progetto_MembriPrimaryKey> {
    List<Progetto_Membri> findByProgetto(Progetti progetto);
}
