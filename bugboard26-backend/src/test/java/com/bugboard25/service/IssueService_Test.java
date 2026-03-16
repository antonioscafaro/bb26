package com.bugboard25.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.bugboard25.dto.IssueCreateRequestDTO;
import com.bugboard25.dto.IssueDTO;
import com.bugboard25.dto.IssueUpdateRequestDTO;
import com.bugboard25.entity.Etichette;
import com.bugboard25.entity.Issue;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.priorita_issue;
import com.bugboard25.entity.enumerations.stato_issue;
import com.bugboard25.entity.enumerations.tipo_issue;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import com.bugboard25.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class IssueService_Test {
    @Mock
    private IssueRepository issueRepository;

    @Mock
    private UtentiRepository utentiRepository;

    @Mock
    private ProgettiRepository progettiRepository;

    @Mock
    private Progetto_MembriRepository progetto_MembriRepository;

    @Mock
    private UtentiService utentiService;

    @Mock
    private SseService sseService;

    @Mock
    private NotificheService notificheService;

    @Mock
    private EtichetteService etichetteService;

    @Mock
    private Issue_EtichetteService issue_EtichetteService;

    @Mock
    private AllegatiService allegatiService;

    @InjectMocks
    private IssueService issueService;

    private Issue issue;
    private Progetti progetto;
    private Utenti admin;
    private Utenti author;
    private Utenti intruder;

    @BeforeEach
    public void setup() {
        progetto = new Progetti();
        progetto.setId(1);
        progetto.setNome("Test Project");

        author = new Utenti();
        author.setEmail("author@test.com");
        author.setRuolo(tipo_ruolo.UTENTE);

        admin = new Utenti();
        admin.setEmail("admin@test.com");
        admin.setRuolo(tipo_ruolo.AMMINISTRATORE);

        intruder = new Utenti();
        intruder.setEmail("intruder@test.com");
        intruder.setRuolo(tipo_ruolo.UTENTE);

        issue = new Issue();
        issue.setId(100);
        issue.setAutore(author);
        issue.setTitolo("Old Title");
        issue.setIdProgetto(progetto);
    }

    @Test
    public void testUpdateIssueById_AdminSetsFields(){
        IssueUpdateRequestDTO dto = new IssueUpdateRequestDTO();
        dto.setTitolo("New Title");
        dto.setStatoIssue(stato_issue.IN_LAVORAZIONE);
        dto.setAssegnatario("admin@test.com");
        dto.setDescrizione("Test Description");
        dto.setPrioritaIssue(priorita_issue.CRITICA);
        dto.setTipoIssue(tipo_issue.BUG);
        dto.setEtichette(new ArrayList<>());

        when(issueRepository.findById(100)).thenReturn(Optional.of(issue));
        when(utentiRepository.findById("admin@test.com")).thenReturn(Optional.of(admin));
        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));

        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueDTO result = issueService.updateIssueById(100, dto, "admin@test.com");

        assertNotNull(result);
        assertEquals("New Title", result.getTitolo());
        assertEquals(stato_issue.IN_LAVORAZIONE, result.getStatoIssue());
        assertEquals("admin@test.com", result.getAssegnatario().getEmail());
        assertEquals("Test Description", result.getDescrizione());
        assertEquals(priorita_issue.CRITICA, result.getPrioritaIssue());
        assertEquals(tipo_issue.BUG, result.getTipoIssue());

        verify(etichetteService, never()).findOrCreate(anyString(), any());
        verify(issueRepository, times(1)).save(any(Issue.class));
        verify(notificheService, times(1)).creaNotificaAssegnazione(any());
    }

    @Test
    public void testUpdateIssueById_EmptyAssignee(){
        IssueUpdateRequestDTO dto = new IssueUpdateRequestDTO();
        dto.setAssegnatario("");

        when(issueRepository.findById(100)).thenReturn(Optional.of(issue));
        when(utentiRepository.findById("author@test.com")).thenReturn(Optional.of(author));
        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));

        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueDTO result = issueService.updateIssueById(100, dto, "author@test.com");

        assertNotNull(result);
        assertNull(result.getAssegnatario());
        verify(issueRepository, times(1)).save(any(Issue.class));
    }

    @Test
    public void testUpdateIssueById_AuthorAssignsIssue(){
        Utenti oldAssignee = new Utenti();
        oldAssignee.setEmail("oldassignee@test.com");
        issue.setAssegnatario(oldAssignee);

        Utenti newAssignee = new Utenti();
        newAssignee.setEmail("assignee@test.com");

        IssueUpdateRequestDTO dto = new IssueUpdateRequestDTO();
        dto.setAssegnatario("assignee@test.com");

        when(issueRepository.findById(100)).thenReturn(Optional.of(issue));
        when(utentiRepository.findById("author@test.com")).thenReturn(Optional.of(author));
        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));

        when(utentiRepository.findById("assignee@test.com")).thenReturn(Optional.of(newAssignee));
        when(progetto_MembriRepository.existsById(any())).thenReturn(true);

        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueDTO result = issueService.updateIssueById(100, dto, "author@test.com");

        assertNotNull(result);
        assertEquals("assignee@test.com", result.getAssegnatario().getEmail());
        verify(notificheService, times(1)).creaNotificaAssegnazione(any());
        verify(issueRepository, times(1)).save(any());
    }

    @Test
    public void testUpdateIssueById_AdminSetsLabels(){
        issue.setAssegnatario(admin);
        IssueUpdateRequestDTO dto = new IssueUpdateRequestDTO();
        dto.setAssegnatario("admin@test.com");
        dto.setEtichette(Arrays.asList("Label 1", "Label 2"));

        when(issueRepository.findById(100)).thenReturn(Optional.of(issue));
        when(utentiRepository.findById("admin@test.com")).thenReturn(Optional.of(admin));
        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Etichette label1 = new Etichette();
        label1.setId(10);
        label1.setNome("Label 1");

        Etichette label2 = new Etichette();
        label2.setId(11);
        label2.setNome("Label 2");

        when(etichetteService.findOrCreate(eq("Label 1"), any())).thenReturn(label1);
        when(etichetteService.findOrCreate(eq("Label 2"), any())).thenReturn(label2);

        IssueDTO result = issueService.updateIssueById(100, dto, "admin@test.com");

        assertNotNull(result);
        assertEquals("admin@test.com", result.getAssegnatario().getEmail());
        verify(etichetteService, times(2)).findOrCreate(anyString(), any(Progetti.class));
        verify(issueRepository, times(1)).save(any());
    }

    @Test
    public void testUpdateIssueById_AssigneeNotProjectMember() {
        Utenti newAssignee = new Utenti();
        newAssignee.setEmail("assignee@test.com");

        IssueUpdateRequestDTO dto = new IssueUpdateRequestDTO();
        dto.setAssegnatario("assignee@test.com");

        when(issueRepository.findById(100)).thenReturn(Optional.of(issue));
        when(utentiRepository.findById("author@test.com")).thenReturn(Optional.of(author));
        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));

        when(utentiRepository.findById("assignee@test.com")).thenReturn(Optional.of(newAssignee));

        when(progetto_MembriRepository.existsById(any())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            issueService.updateIssueById(100, dto, "author@test.com");
        });

        assertEquals("L'utente selezionato non è membro del progetto", exception.getMessage());

        verify(notificheService, never()).creaNotificaAssegnazione(any());
        verify(issueRepository, never()).save(any());
    }

    @Test
    public void testUpdateIssueById_IntruderUpdates(){
        IssueUpdateRequestDTO dto = new IssueUpdateRequestDTO();
        dto.setTitolo("Intruder updated");

        when(issueRepository.findById(100)).thenReturn(Optional.of(issue));
        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));
        when(utentiRepository.findById("intruder@test.com")).thenReturn(Optional.of(intruder));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
           issueService.updateIssueById(100, dto, "intruder@test.com");
        });

        assertEquals("Non hai i permessi per modificare questa issue.", exception.getMessage());
        verify(issueRepository, never()).save(any());
    }

    @Test
    public void testCreaIssue_NoFileOneLabel() throws IOException {
        IssueCreateRequestDTO dto = new IssueCreateRequestDTO();
        dto.setDescrizione("Test Description");
        dto.setPrioritaIssue(priorita_issue.CRITICA);
        dto.setTitolo("Test Issue");
        dto.setTipoIssue(tipo_issue.BUG);
        dto.setEmailAutore(author.getEmail());
        dto.setIdProgetto(1);
        dto.setEtichette(Arrays.asList("Label 1"));

        Etichette label1 = new Etichette();
        label1.setId(10);
        label1.setNome("Label 1");

        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));
        when(utentiRepository.findById("author@test.com")).thenReturn(Optional.of(author));

        when(issueRepository.save(any(Issue.class))).thenReturn(issue);

        when(progetto_MembriRepository.findByProgetto(any(Progetti.class))).thenReturn(new ArrayList<>());
        when(utentiService.getUtentiByRuolo(tipo_ruolo.AMMINISTRATORE)).thenReturn(new ArrayList<>());

        when(etichetteService.findOrCreate(eq("Label 1"), any())).thenReturn(label1);

        IssueDTO result = issueService.creaIssue(dto, null);

        assertNotNull(result);
        verify(issueRepository, times(1)).save(any(Issue.class));
        verify(etichetteService, times(1)).findOrCreate(eq("Label 1"), any(Progetti.class));
        verify(allegatiService, never()).salvaFile(any(), anyInt());
    }

    @Test
    public void testCreaIssue_WithFileNoLabels() throws IOException {
        IssueCreateRequestDTO dto = new IssueCreateRequestDTO();
        dto.setIdProgetto(1);
        dto.setEmailAutore(author.getEmail());

        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));
        when(utentiRepository.findById("author@test.com")).thenReturn(Optional.of(author));


        when(issueRepository.save(any(Issue.class))).thenReturn(issue);


        when(progetto_MembriRepository.findByProgetto(any(Progetti.class))).thenReturn(new ArrayList<>());
        when(utentiService.getUtentiByRuolo(tipo_ruolo.AMMINISTRATORE)).thenReturn(new ArrayList<>());

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);

        when(allegatiService.salvaFile(any(MultipartFile.class), eq(100))).thenReturn(null);

        IssueDTO result = issueService.creaIssue(dto, file);
        assertNotNull(result);
        verify(allegatiService, times(1)).salvaFile(any(), eq(100));
    }

    @Test
    public void testCreaIssue_WithFileAndError() throws IOException {
        IssueCreateRequestDTO dto = new IssueCreateRequestDTO();
        dto.setIdProgetto(1);
        dto.setEmailAutore(author.getEmail());
        dto.setEtichette(new ArrayList<>());

        when(progettiRepository.findById(1)).thenReturn(Optional.of(progetto));
        when(utentiRepository.findById("author@test.com")).thenReturn(Optional.of(author));

        when(issueRepository.save(any(Issue.class))).thenReturn(issue);

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);

        when(allegatiService.salvaFile(any(MultipartFile.class), eq(100))).thenThrow(new IOException("porco dio"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
           issueService.creaIssue(dto, file);
        });

        assertEquals("Upload file fallito. L'issue è stata creata (100) ma l'allegato no.", exception.getMessage());
        verify(issueRepository, times(1)).save(any(Issue.class));
    }
}
