package com.bugboard25.dto;

public class NotificheAssegnazioneCreateRequestDTO extends NotificheCreazioneRequestDTO {
    private int idIssue;

    public int getIdIssue() {
        return idIssue;
    }

    public void setIdIssue(int idIssue) {
        this.idIssue = idIssue;
    }
}
