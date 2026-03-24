package com.bugboard25.repository;

import com.bugboard25.entity.composedprimarykeys.ProgettoMembriPrimaryKey;
import com.bugboard25.entity.ProgettoMembri;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgettoMembriRepository extends JpaRepository<ProgettoMembri, ProgettoMembriPrimaryKey> {
    List<ProgettoMembri> findByProgetto(Progetti progetto);
    void deleteAllByUtente(Utenti utente);
}
