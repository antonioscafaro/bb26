package com.bugboard25.entity;

import com.bugboard25.entity.enumerations.TipoNotifica;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.util.Date;

@Entity
public class Notifiche {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "email_utente")
    private Utenti destinatario;

    @ManyToOne
    @JoinColumn(name = "id_issue")
    private Issue issue;

    public void setId(int id) {
        this.id = id;
    }

    public void setDestinatario(Utenti destinatario) {
        this.destinatario = destinatario;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public void setTipoNotifica(TipoNotifica tipoNotifica) {
        this.tipoNotifica = tipoNotifica;
    }

    public void setTesto(String testo) {
        this.testo = testo;
    }

    public void setLetto(boolean letto) {
        this.letto = letto;
    }

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "tipo_notifica")
    private TipoNotifica tipoNotifica;

    @Column(nullable = false)
    private String testo;

    private boolean letto;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_creazione")
    private Date dataCreazione;

    public void setDataCreazione(Date dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public Date getDataCreazione() {
        return dataCreazione;
    }

    public int getId() {
        return id;
    }

    public Utenti getDestinatario() {
        return destinatario;
    }

    public Issue getIssue() {
        return issue;
    }

    public TipoNotifica getTipoNotifica() {
        return tipoNotifica;
    }

    public String getTesto() {
        return testo;
    }

    public boolean isLetto() {
        return letto;
    }
}
