package com.bugboard25.service;

import com.bugboard25.dto.IssueEtichettaCreateRequestDTO;
import com.bugboard25.entity.ComposedPrimaryKeys.IssueEtichettePrimaryKey;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.IssueEtichette;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.EtichetteRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.IssueEtichetteRepository;
import org.springframework.stereotype.Service;

@Service
public class IssueEtichetteService {

    private final IssueEtichetteRepository issueEtichetteRepository;
    private final IssueRepository issueRepository;
    private final EtichetteRepository etichetteRepository;

    public IssueEtichetteService(IssueEtichetteRepository issueEtichetteRepository,
                                 IssueRepository issueRepository, EtichetteRepository etichetteRepository) {
        this.issueEtichetteRepository = issueEtichetteRepository;
        this.issueRepository = issueRepository;
        this.etichetteRepository = etichetteRepository;
    }

    public IssueEtichette associaEtichetta(IssueEtichettaCreateRequestDTO dto) {
        Issue issue = issueRepository.findById(dto.getIdIssue())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_ESISTENTE));

        Etichette etichetta = etichetteRepository.findById(dto.getIdEtichetta())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ETICHETTA_NON_ESISTENTE));

        IssueEtichettePrimaryKey pk = new IssueEtichettePrimaryKey(
                dto.getIdIssue(),
                dto.getIdEtichetta()
        );

        IssueEtichette associazione = new IssueEtichette();
        associazione.setId(pk);
        associazione.setEtichetta(etichetta);
        associazione.setIssue(issue);

        return issueEtichetteRepository.save(associazione);
    }

    public void rimuoviTutteDaIssue(int issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NON_ESISTENTE));
        issueEtichetteRepository.deleteAllByIssue(issue);
    }
}
