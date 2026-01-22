package com.bugboard25.dto;

import com.bugboard25.entity.Issue;

public class AllegatiCreateRequestDTO {
    private Issue issue;
    private String nomeFile;
    private String tipoFile;

    public Issue getIssue() {
        return issue;
    }

    public String getNomeFile() {
        return nomeFile;
    }

    public String getTipoFile() {
        return tipoFile;
    }
}
