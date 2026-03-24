package com.bugboard25.repository;

import com.bugboard25.entity.Notifiche;
import com.bugboard25.entity.Utenti;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificheRepository extends JpaRepository<Notifiche, Integer> {
    List<Notifiche> findAllByDestinatarioAndLetto(Utenti destinatario, Sort sort, boolean letto);
    List<Notifiche> findAllByDestinatarioAndLettoIsFalse(Utenti destinatario, Sort sort);
    void deleteAllByDestinatario(Utenti destinatario);
}
