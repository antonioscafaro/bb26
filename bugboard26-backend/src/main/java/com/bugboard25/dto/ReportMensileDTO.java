package com.bugboard25.dto;

import java.util.List;
import java.util.Map;

public class ReportMensileDTO {
    private long totaleIssueCreate;
    private long totaleIssueRisolte;
    private long totaleIssueAperte;
    private double tempoMedioRisoluzioneGlobale;
    private Map<String, Double> distribuzionePerTipo;
    private Map<String, Double> distribuzionePerPriorita;
    private List<ReportUtenteDTO> performanceUtenti;
    private List<IssueDTO> allerteCritiche;

    public long getTotaleIssueCreate() { return totaleIssueCreate; }
    public void setTotaleIssueCreate(long totaleIssueCreate) { this.totaleIssueCreate = totaleIssueCreate; }
    public long getTotaleIssueRisolte() { return totaleIssueRisolte; }
    public void setTotaleIssueRisolte(long totaleIssueRisolte) { this.totaleIssueRisolte = totaleIssueRisolte; }
    public long getTotaleIssueAperte() { return totaleIssueAperte; }
    public void setTotaleIssueAperte(long totaleIssueAperte) { this.totaleIssueAperte = totaleIssueAperte; }
    public double getTempoMedioRisoluzioneGlobale() { return tempoMedioRisoluzioneGlobale; }
    public void setTempoMedioRisoluzioneGlobale(double tempoMedioRisoluzioneGlobale) { this.tempoMedioRisoluzioneGlobale = tempoMedioRisoluzioneGlobale; }
    public Map<String, Double> getDistribuzionePerTipo() { return distribuzionePerTipo; }
    public void setDistribuzionePerTipo(Map<String, Double> distribuzionePerTipo) { this.distribuzionePerTipo = distribuzionePerTipo; }
    public Map<String, Double> getDistribuzionePerPriorita() { return distribuzionePerPriorita; }
    public void setDistribuzionePerPriorita(Map<String, Double> distribuzionePerPriorita) { this.distribuzionePerPriorita = distribuzionePerPriorita; }
    public List<ReportUtenteDTO> getPerformanceUtenti() { return performanceUtenti; }
    public void setPerformanceUtenti(List<ReportUtenteDTO> performanceUtenti) { this.performanceUtenti = performanceUtenti; }
    public List<IssueDTO> getAllerteCritiche() { return allerteCritiche; }
    public void setAllerteCritiche(List<IssueDTO> allerteCritiche) { this.allerteCritiche = allerteCritiche; }
}