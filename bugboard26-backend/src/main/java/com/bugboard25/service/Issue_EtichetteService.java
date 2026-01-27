package com.bugboard25.service;

import com.bugboard25.dto.Issue_EtichettaCreateRequestDTO;
import com.bugboard25.entity.ComposedPrimaryKeys.Issue_EtichettePrimaryKey;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Issue_Etichette;
import com.bugboard25.repository.EtichetteRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.Issue_EtichetteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Issue_EtichetteService {
    @Autowired
    private Issue_EtichetteRepository issue_EtichetteRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private EtichetteRepository etichetteRepository;

    public Issue_Etichette associaEtichetta(Issue_EtichettaCreateRequestDTO dto){
        Issue issue = issueRepository.findById(dto.getIdIssue())
                .orElseThrow(()-> new RuntimeException("Issue non esistente"));

        Etichette etichetta = etichetteRepository.findById(dto.getIdEtichetta())
                .orElseThrow(()-> new RuntimeException("Etichetta non esistente"));

        Issue_EtichettePrimaryKey pk = new Issue_EtichettePrimaryKey(
                dto.getIdIssue(),
                dto.getIdEtichetta()
        );

        Issue_Etichette associazione = new Issue_Etichette();
        associazione.setId(pk);
        associazione.setEtichetta(etichetta);
        associazione.setIssue(issue);

        return issue_EtichetteRepository.save(associazione);
    }

    public void rimuoviTutteDaIssue(int issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue non esistente"));
        issue_EtichetteRepository.deleteAllByIssue(issue);
    }
}
