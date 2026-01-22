package com.bugboard25.dto;

public class ReportUtenteDTO {
    private UtentiDTO utente;
    private long issueCreate;
    private long issueAssegnate;
    private long issueRisolte;
    private double tempoMedioRisoluzionePersonale;
    private double efficienza;

    public UtentiDTO getUtente() { return utente; }
    public void setUtente(UtentiDTO utente) { this.utente = utente; }
    public long getIssueCreate() { return issueCreate; }
    public void setIssueCreate(long issueCreate) { this.issueCreate = issueCreate; }
    public long getIssueAssegnate() { return issueAssegnate; }
    public void setIssueAssegnate(long issueAssegnate) { this.issueAssegnate = issueAssegnate; }
    public long getIssueRisolte() { return issueRisolte; }
    public void setIssueRisolte(long issueRisolte) { this.issueRisolte = issueRisolte; }
    public double getTempoMedioRisoluzionePersonale() { return tempoMedioRisoluzionePersonale; }
    public void setTempoMedioRisoluzionePersonale(double tempoMedioRisoluzionePersonale) { this.tempoMedioRisoluzionePersonale = tempoMedioRisoluzionePersonale; }
    public double getEfficienza() { return efficienza; }
    public void setEfficienza(double efficienza) { this.efficienza = efficienza; }
}