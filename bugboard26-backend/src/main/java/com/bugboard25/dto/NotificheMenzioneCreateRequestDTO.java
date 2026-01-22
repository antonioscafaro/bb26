package com.bugboard25.dto;

public class NotificheMenzioneCreateRequestDTO extends NotificheCreazioneRequestDTO {
    private int idCommento;
    private String menzionante;

    public void setIdCommento(int idCommento) {
        this.idCommento = idCommento;
    }

    public void setMenzionante(String menzionante) {
        this.menzionante = menzionante;
    }

    public String getMenzionante() {
        return menzionante;
    }

    public int getIdCommento() {
        return idCommento;
    }
}
