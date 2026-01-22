package com.bugboard25.dto;

public class NotificheCreazioneRequestDTO {
    private String destinatario;
    private String testo;

    public void setDestinatario(String destinatario) {
        this.destinatario = destinatario;
    }

    public void setTesto(String testo) {
        this.testo = testo;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public String getTesto() {
        return testo;
    }
}
