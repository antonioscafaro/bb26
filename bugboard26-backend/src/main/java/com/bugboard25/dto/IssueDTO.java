package com.bugboard25.dto;

import com.bugboard25.entity.Issue;
import com.bugboard25.entity.enumerations.PrioritaIssue;
import com.bugboard25.entity.enumerations.StatoIssue;
import com.bugboard25.entity.enumerations.TipoIssue;
import com.bugboard25.repository.UtentiRepository;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IssueDTO {
    private int id;
    private ProgettiDTO progetto;
    private UtentiDTO autore;
    private UtentiDTO assegnatario;
    private String titolo;
    private String descrizione;
    private TipoIssue tipoIssue;
    private StatoIssue statoIssue;
    private PrioritaIssue prioritaIssue;
    private Date dataCreazione;
    private Date dataUltimoAggiornamento;
    private List<AllegatoDTO> allegati;
    private List<String> labels;
    private List<CommentoCompletoDTO> commenti;

    public IssueDTO(Issue issue) {
        this(issue, null);
    }

    public IssueDTO(Issue issue, UtentiRepository utentiRepository) {
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
                    .toList();
        }

        if (issue.getEtichette() != null) {
            this.labels = issue.getEtichette().stream()
                    .map(ie -> ie.getEtichetta().getNome())
                    .toList();
        }

        if (issue.getCommenti() != null) {
            this.commenti = issue.getCommenti().stream()
                    .map(c -> {
                        if (utentiRepository != null) {
                            List<String> emails = estraiMenzioni(c.getTesto());
                            List<AutoreCommentoDTO> menzionati = new ArrayList<>();
                            for (String email : emails) {
                                utentiRepository.findById(email)
                                        .ifPresent(u -> menzionati.add(new AutoreCommentoDTO(u)));
                            }
                            return new CommentoCompletoDTO(c, menzionati);
                        }
                        return new CommentoCompletoDTO(c);
                    })
                    .toList();
        }
    }

    private static List<String> estraiMenzioni(String testo) {
        List<String> emails = new ArrayList<>();
        Matcher matcher = Pattern.compile("\\B@([\\w.+%-]+@[\\w.-]+\\.[a-zA-Z]{2,})").matcher(testo);
        while (matcher.find()) {
            emails.add(matcher.group(1));
        }
        return emails;
    }

    public int getId() { return id; }
    public ProgettiDTO getProgetto() { return progetto; }
    public UtentiDTO getAutore() { return autore; }
    public UtentiDTO getAssegnatario() { return assegnatario; }
    public String getTitolo() { return titolo; }
    public String getDescrizione() { return descrizione; }
    public TipoIssue getTipoIssue() { return tipoIssue; }
    public StatoIssue getStatoIssue() { return statoIssue; }
    public PrioritaIssue getPrioritaIssue() { return prioritaIssue; }
    public Date getDataCreazione() { return dataCreazione; }
    public Date getDataUltimoAggiornamento() { return dataUltimoAggiornamento; }
    public List<AllegatoDTO> getAllegati() { return allegati; }
    public List<String> getLabels() { return labels; }
    public List<CommentoCompletoDTO> getCommenti() { return commenti; }
}