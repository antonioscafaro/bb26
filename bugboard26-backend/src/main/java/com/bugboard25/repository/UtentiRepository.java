package com.bugboard25.repository;

import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UtentiRepository extends JpaRepository<Utenti, String> {
    boolean existsByEmail(String email);
    @Query("SELECT pm.utente FROM Progetto_Membri pm WHERE pm.progetto.id = :progettoId")
    List<Utenti> findMembriByProgettoId(@Param("progettoId") Integer progettoId);

    List<Utenti> findByEmail(String email);

    List<Utenti> findByRuolo(tipo_ruolo ruolo);
}
