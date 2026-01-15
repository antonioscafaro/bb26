package com.bugboard25.repository;

import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.priorita_issue;
import com.bugboard25.entity.enumerations.stato_issue;
import com.bugboard25.entity.enumerations.tipo_issue;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Integer> {
    List<Issue> findAllByAssegnatarioAndIdProgetto(Utenti assegnatario, Progetti idProgetto, Sort sort);
    List<Issue> findAllByStatoIssue(stato_issue statoIssue, Sort sort);
    List<Issue> findAllByPrioritaIssue(priorita_issue prioritaIssue, Sort sort);
    List<Issue> findAllByDataCreazioneBetween(Date dataInizio, Date dataFine, Sort sort);
    List<Issue> findAllByAutore(Utenti autore, Sort sort);
    List<Issue> findAllByIdProgetto(Progetti idProgetto, Sort sort);
    List<Issue> findAllByTipoIssue(tipo_issue tipoIssue, Sort sort);
    @Query("SELECT ie.issue FROM Issue_Etichette ie WHERE ie.etichetta = :etichetta")
    List<Issue> findByEtichetta(@Param("etichetta") Etichette etichetta, Sort sort);

    // Optimized Report Queries using JPQL
    
    // 1. Created in interval
    List<Issue> findByDataCreazioneBetween(Date start, Date end);
    List<Issue> findByIdProgettoAndDataCreazioneBetween(Progetti progetto, Date start, Date end);

    // 2. Resolved in interval (using LastUpdate as proxy for resolution date)
    List<Issue> findByStatoIssueAndDataUltimoAggiornamentoBetween(stato_issue stato, Date start, Date end);
    List<Issue> findByIdProgettoAndStatoIssueAndDataUltimoAggiornamentoBetween(Progetti progetto, stato_issue stato, Date start, Date end);

    // 3. Open (Snapshot: not resolved, not closed, not archived)
    // Note: 'Open' means currently open, regardless of creation date? 
    // Usually reports show "Open at end of period" or "Currently Open". 
    // Based on previous code: it was "tutteLeIssue.filter(!RISOLTA && !CHIUSA && !ARCHIVIATA)". So it's "Currently Open".
    @Query("SELECT COUNT(i) FROM Issue i WHERE i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpen();

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.idProgetto = :progetto AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpenByProject(@Param("progetto") Progetti progetto);

    // 4. Critical Alerts (Critical, Open, Created > 7 days ago)
    @Query("SELECT i FROM Issue i WHERE i.prioritaIssue = 'CRITICA' AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA') AND i.dataCreazione < :dateLimit")
    List<Issue> findCriticalAlerts(@Param("dateLimit") Date dateLimit);

    @Query("SELECT i FROM Issue i WHERE i.idProgetto = :progetto AND i.prioritaIssue = 'CRITICA' AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA') AND i.dataCreazione < :dateLimit")
    List<Issue> findCriticalAlertsByProject(@Param("progetto") Progetti progetto, @Param("dateLimit") Date dateLimit);

    // User Specific Counts
    long countByAssegnatario(Utenti assegnatario);
    long countByAssegnatarioAndIdProgetto(Utenti assegnatario, Progetti idProgetto);

    @Query("SELECT COUNT(i) FROM Issue i WHERE (i.assegnatario = :user OR i.autore = :user) AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpenByUser(@Param("user") Utenti user);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.idProgetto = :progetto AND (i.assegnatario = :user OR i.autore = :user) AND i.statoIssue NOT IN ('RISOLTA', 'CHIUSA', 'ARCHIVIATA')")
    long countCurrentlyOpenByProjectAndUser(@Param("progetto") Progetti progetto, @Param("user") Utenti user);
}
