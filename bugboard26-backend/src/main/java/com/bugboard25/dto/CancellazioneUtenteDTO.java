package com.bugboard25.dto;

public class CancellazioneUtenteDTO {
    private String emailCancellazione;
    private String emailCancellante;

    public String getEmailCancellante() {
        return emailCancellante;
    }

    public String getEmailCancellazione() {
        return emailCancellazione;
    }

    public void setEmailCancellazione(String emailCancellazione) {
        this.emailCancellazione = emailCancellazione;
    }

    public void setEmailCancellante(String emailCancellante) {
        this.emailCancellante = emailCancellante;
    }
}
