package com.bugboard25.repository;

import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EtichetteRepository extends JpaRepository<Etichette, Integer> {

    List<Etichette> findByNome(String nome);

    /**
     * CORREZIONE:
     * Abbiamo sostituito il metodo con una @Query manuale per evitare
     * errori di parsing del nome.
     * Questo cerca tutte le Etichette dove l'ID dell'oggetto id_progetto
     * corrisponde al parametro.
     */
    @Query("SELECT e FROM Etichette e WHERE e.id_progetto.id = :progettoId")
    List<Etichette> findByProgettoIdQuery(@Param("progettoId") int progettoId);

    @Query("SELECT ir.etichetta FROM Issue_Etichette ir WHERE ir.issue = :issue")
    List<Etichette> findEtichetteByIssue(@Param("issue") Issue issue);

    // Il metodo "Integer id(int id);" è stato RIMOSSO perché non è valido
    // e probabilmente contribuiva all'errore.
}