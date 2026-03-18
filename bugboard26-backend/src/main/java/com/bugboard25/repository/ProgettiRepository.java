package com.bugboard25.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.bugboard25.entity.Progetti;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProgettiRepository extends JpaRepository<Progetti, Integer> {
    @Query("SELECT pm.progetto FROM ProgettoMembri pm WHERE pm.utente.email = :emailUtente")
    List<Progetti> findProgettiByMembroEmail(@Param("emailUtente") String emailUtente);

    boolean existsByNome(String nome);

    List<Progetti> findProgettiByNome(String nome);
}
