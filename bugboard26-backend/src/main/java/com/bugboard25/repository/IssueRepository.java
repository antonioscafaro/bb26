package com.bugboard25.repository;

import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.PrioritaIssue;
import com.bugboard25.entity.enumerations.StatoIssue;
import com.bugboard25.entity.enumerations.TipoIssue;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Integer> {
    List<Issue> findAllByAssegnatarioAndIdProgetto(Utenti assegnatario, Progetti idProgetto, Sort sort);
    List<Issue> findAllByStatoIssue(StatoIssue statoIssue, Sort sort);
    List<Issue> findAllByPrioritaIssue(PrioritaIssue prioritaIssue, Sort sort);
    List<Issue> findAllByDataCreazioneBetween(Date dataInizio, Date dataFine, Sort sort);
    List<Issue> findAllByAutore(Utenti autore, Sort sort);
    List<Issue> findAllByIdProgetto(Progetti idProgetto, Sort sort);
    List<Issue> findAllByTipoIssue(TipoIssue tipoIssue, Sort sort);
    @Query("SELECT ie.issue FROM IssueEtichette ie WHERE ie.etichetta = :etichetta")
    List<Issue> findByEtichetta(@Param("etichetta") Etichette etichetta, Sort sort);

    List<Issue> findByDataCreazioneBetween(Date start, Date end);
    List<Issue> findByIdProgettoAndDataCreazioneBetween(Progetti progetto, Date start, Date end);

    List<Issue> findByStatoIssueAndDataUltimoAggiornamentoBetween(StatoIssue stato, Date start, Date end);
    List<Issue> findByIdProgettoAndStatoIssueAndDataUltimoAggiornamentoBetween(Progetti progetto, StatoIssue stato, Date start, Date end);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpen();

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.idProgetto = :progetto AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpenByProject(@Param("progetto") Progetti progetto);

    @Query("SELECT i FROM Issue i WHERE i.prioritaIssue = 'CRITICA' AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA') AND i.dataCreazione < :dateLimit")
    List<Issue> findCriticalAlerts(@Param("dateLimit") Date dateLimit);

    @Query("SELECT i FROM Issue i WHERE i.idProgetto = :progetto AND i.prioritaIssue = 'CRITICA' AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA') AND i.dataCreazione < :dateLimit")
    List<Issue> findCriticalAlertsByProject(@Param("progetto") Progetti progetto, @Param("dateLimit") Date dateLimit);

    long countByAssegnatario(Utenti assegnatario);
    long countByAssegnatarioAndIdProgetto(Utenti assegnatario, Progetti idProgetto);

    @Query("SELECT COUNT(i) FROM Issue i WHERE (i.assegnatario = :user OR i.autore = :user) AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpenByUser(@Param("user") Utenti user);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.idProgetto = :progetto AND (i.assegnatario = :user OR i.autore = :user) AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpenByProjectAndUser(@Param("progetto") Progetti progetto, @Param("user") Utenti user);
}
