package com.bugboard25.dto;

import com.bugboard25.entity.Issue;
import com.bugboard25.entity.enumerations.priorita_issue;
import com.bugboard25.entity.enumerations.stato_issue;
import com.bugboard25.entity.enumerations.tipo_issue;

import java.util.Date;

public class IssueDTO {
    private int id;
    private ProgettiDTO progetto; // DTO annidato
    private UtentiDTO autore; // DTO annidato
    private UtentiDTO assegnatario; // DTO annidato (può essere null)
    private String titolo;
    private String descrizione;
    private tipo_issue tipoIssue;
    private stato_issue statoIssue;
    private priorita_issue prioritaIssue;
    private Date dataCreazione;
    private Date dataUltimoAggiornamento;
    private java.util.List<AllegatoDTO> allegati;
    private java.util.List<String> labels;
    private java.util.List<CommentoCompletoDTO> commenti;


    public IssueDTO(Issue issue) {
        this.id = issue.getId();
        this.titolo = issue.getTitolo();
        this.descrizione = issue.getDescrizione();
        this.tipoIssue = issue.getTipoIssue();
        this.statoIssue = issue.getStatoIssue();
        this.prioritaIssue = issue.getPrioritaIssue();
        this.dataCreazione = issue.getDataCreazione();
        this.dataUltimoAggiornamento = issue.getDataUltimoAggiornamento();

        if (issue.getIdProgetto() != null) {
            this.progetto = new ProgettiDTO(issue.getIdProgetto());
        }
        if (issue.getAutore() != null) {
            this.autore = new UtentiDTO(issue.getAutore());
        }
        if (issue.getAssegnatario() != null) {
            this.assegnatario = new UtentiDTO(issue.getAssegnatario());
        } else {
            this.assegnatario = null;
        }

        if (issue.getAllegati() != null) {
            this.allegati = issue.getAllegati().stream()
                    .map(AllegatoDTO::new)
                    .collect(java.util.stream.Collectors.toList());
        }

        if (issue.getEtichette() != null) {
            this.labels = issue.getEtichette().stream()
                    .map(ie -> ie.getEtichetta().getNome())
                    .collect(java.util.stream.Collectors.toList());
        }

        if (issue.getCommenti() != null) {
            this.commenti = issue.getCommenti().stream()
                    .map(CommentoCompletoDTO::new)
                    .collect(java.util.stream.Collectors.toList());
        }
    }

    public int getId() { return id; }
    public ProgettiDTO getProgetto() { return progetto; }
    public UtentiDTO getAutore() { return autore; }
    public UtentiDTO getAssegnatario() { return assegnatario; }
    public String getTitolo() { return titolo; }
    public String getDescrizione() { return descrizione; }
    public tipo_issue getTipoIssue() { return tipoIssue; }
    public stato_issue getStatoIssue() { return statoIssue; }
    public priorita_issue getPrioritaIssue() { return prioritaIssue; }
    public Date getDataCreazione() { return dataCreazione; }
    public Date getDataUltimoAggiornamento() { return dataUltimoAggiornamento; }
    public java.util.List<AllegatoDTO> getAllegati() { return allegati; }
    public java.util.List<String> getLabels() { return labels; }
    public java.util.List<CommentoCompletoDTO> getCommenti() { return commenti; }
}