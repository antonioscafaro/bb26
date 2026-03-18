package com.bugboard25.dto;

import com.bugboard25.entity.Notifiche;
import com.bugboard25.entity.enumerations.TipoNotifica;
import java.util.Date;

public class NotificheDTO {
    private int id;
    private String destinatarioEmail;
    private Integer idIssue; // Può essere nullo se la notifica non è legata a una issue
    private TipoNotifica tipoNotifica;
    private String testo;
    private boolean letto;
    private Date dataCreazione;

    public NotificheDTO(Notifiche notifica) {
        this.id = notifica.getId();
        this.testo = notifica.getTesto();
        this.tipoNotifica = notifica.getTipoNotifica();
        this.letto = notifica.isLetto();
        this.dataCreazione = notifica.getDataCreazione();

        if (notifica.getDestinatario() != null) {
            this.destinatarioEmail = notifica.getDestinatario().getEmail();
        }
        if (notifica.getIssue() != null) {
            this.idIssue = notifica.getIssue().getId();
        }
    }

    public int getId() { return id; }
    public String getDestinatarioEmail() { return destinatarioEmail; }
    public Integer getIdIssue() { return idIssue; }
    public TipoNotifica getTipoNotifica() { return tipoNotifica; }
    public String getTesto() { return testo; }
    public boolean isLetto() { return letto; }
    public Date getDataCreazione() { return dataCreazione; }
}