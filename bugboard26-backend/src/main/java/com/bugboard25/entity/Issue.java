package com.bugboard25.entity;

import com.bugboard25.entity.enumerations.StatoIssue;
import com.bugboard25.entity.enumerations.TipoIssue;
import com.bugboard25.entity.enumerations.PrioritaIssue;
import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_progetto")
    private Progetti idProgetto;

    @ManyToOne
    @JoinColumn(name = "email_autore")
    private Utenti autore;

    @ManyToOne
    @JoinColumn(name = "email_assegnatario")
    private Utenti assegnatario;

    @Column(length = 255, nullable = false)
    private String titolo;

    @Column(nullable = false)
    private String descrizione;

    @Enumerated(EnumType.STRING)
    private TipoIssue tipoIssue;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato_issue")
    private StatoIssue statoIssue;

    @Enumerated(EnumType.STRING)
    @Column(name = "priorita_issue")
    private PrioritaIssue prioritaIssue;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_creazione")
    private Date dataCreazione;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_ultimo_aggiornamento")
    private Date dataUltimoAggiornamento;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Allegati> allegati;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<IssueEtichette> etichette;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Commenti> commenti;

    public void setId(int id) {
        this.id = id;
    }

    public void setIdProgetto(Progetti idProgetto) {
        this.idProgetto = idProgetto;
    }

    public void setAutore(Utenti autore) {
        this.autore = autore;
    }

    public void setAssegnatario(Utenti assegnatario) {
        this.assegnatario = assegnatario;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public void setTipoIssue(TipoIssue tipoIssue) {
        this.tipoIssue = tipoIssue;
    }

    public void setStatoIssue(StatoIssue statoIssue) {
        this.statoIssue = statoIssue;
    }

    public void setPrioritaIssue(PrioritaIssue prioritaIssue) {
        this.prioritaIssue = prioritaIssue;
    }

    public void setDataCreazione(Date dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public void setDataUltimoAggiornamento(Date dataUltimoAggiornamento) {
        this.dataUltimoAggiornamento = dataUltimoAggiornamento;
    }

    public Date getDataUltimoAggiornamento() {
        return dataUltimoAggiornamento;
    }

    public Date getDataCreazione() {
        return dataCreazione;
    }

    public PrioritaIssue getPrioritaIssue() {
        return prioritaIssue;
    }

    public StatoIssue getStatoIssue() {
        return statoIssue;
    }

    public TipoIssue getTipoIssue() {
        return tipoIssue;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public String getTitolo() {
        return titolo;
    }

    public Utenti getAssegnatario() {
        return assegnatario;
    }

    public Utenti getAutore() {
        return autore;
    }

    public Progetti getIdProgetto() {
        return idProgetto;
    }

    public int getId() {
        return id;
    }

    public java.util.List<Allegati> getAllegati() {
        return allegati;
    }

    public void setAllegati(java.util.List<Allegati> allegati) {
        this.allegati = allegati;
    }

    public java.util.List<IssueEtichette> getEtichette() {
        return etichette;
    }

    public void setEtichette(java.util.List<IssueEtichette> etichette) {
        this.etichette = etichette;
    }

    public java.util.List<Commenti> getCommenti() {
        return commenti;
    }

    public void setCommenti(java.util.List<Commenti> commenti) {
        this.commenti = commenti;
    }
}
