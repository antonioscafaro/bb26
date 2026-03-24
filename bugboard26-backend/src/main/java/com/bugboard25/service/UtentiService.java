package com.bugboard25.service;

import com.bugboard25.dto.UtenteCreateRequestDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.exception.BadRequestException;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.CommentiRepository;
import com.bugboard25.repository.IssueRepository;
import com.bugboard25.repository.NotificheRepository;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.ProgettoMembriRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.bugboard25.entity.enumerations.TipoRuolo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Date;

@Service
public class UtentiService implements UserDetailsService {

    private final UtentiRepository utentiRepository;
    private final ProgettiRepository progettiRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificheRepository notificheRepository;
    private final CommentiRepository commentiRepository;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final IssueRepository issueRepository;

    public UtentiService(UtentiRepository utentiRepository, ProgettiRepository progettiRepository,
                         PasswordEncoder passwordEncoder, NotificheRepository notificheRepository,
                         CommentiRepository commentiRepository, ProgettoMembriRepository progettoMembriRepository,
                         IssueRepository issueRepository) {
        this.utentiRepository = utentiRepository;
        this.progettiRepository = progettiRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificheRepository = notificheRepository;
        this.commentiRepository = commentiRepository;
        this.progettoMembriRepository = progettoMembriRepository;
        this.issueRepository = issueRepository;
    }

    public List<UtentiDTO> getUtenti() {
        return utentiRepository.findAll()
                .stream()
                .map(UtentiDTO::new)
                .toList();
    }

    public List<UtentiDTO> getUtentiByProgettoId(int progettoId) {
        Progetti progetto = progettiRepository.findById(progettoId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROGETTO_NON_TROVATO));

        return utentiRepository.findMembriByProgettoId(progetto.getId())
                .stream()
                .map(UtentiDTO::new)
                .toList();
    }

    public UtentiDTO getUtentiByEmail(String email) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));
        return new UtentiDTO(utente);
    }

    public UtentiDTO creaUtente(UtenteCreateRequestDTO requestDTO) {
        if (utentiRepository.existsByEmail(requestDTO.getEmail())) {
            throw new BadRequestException(ErrorMessages.EMAIL_DUPLICATA);
        }

        Utenti utente = new Utenti();
        utente.setNome(requestDTO.getNome());
        utente.setCognome(requestDTO.getCognome());
        utente.setEmail(requestDTO.getEmail());

        String passwordHash = passwordEncoder.encode(requestDTO.getPassword());
        utente.setPasswordHash(passwordHash);

        utente.setRuolo(requestDTO.getRuolo());
        utente.setDataCreazione(new Date());

        Utenti utenteSalvato = utentiRepository.save(utente);
        return new UtentiDTO(utenteSalvato);
    }

    public UtentiDTO updateUtenteByEmail(String email, UtenteCreateRequestDTO requestDTO) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        utente.setNome(requestDTO.getNome());
        utente.setCognome(requestDTO.getCognome());
        utente.setRuolo(requestDTO.getRuolo());
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isEmpty()) {
            utente.setPasswordHash(passwordEncoder.encode(requestDTO.getPassword()));
        }

        Utenti utenteSalvato = utentiRepository.save(utente);
        return new UtentiDTO(utenteSalvato);
    }

    @Transactional
    public void deleteUtenteByEmail(String email) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        // 1. Delete notifications where user is destinatario
        notificheRepository.deleteAllByDestinatario(utente);

        // 2. Delete comments where user is autore
        commentiRepository.deleteAllByAutore(utente);

        // 3. Remove user from all projects (progetto_membri)
        progettoMembriRepository.deleteAllByUtente(utente);

        // 4. Null out issue references (autore, assegnatario)
        issueRepository.findAll().stream()
                .filter(i -> utente.equals(i.getAutore()) || utente.equals(i.getAssegnatario()))
                .forEach(i -> {
                    if (utente.equals(i.getAutore())) i.setAutore(null);
                    if (utente.equals(i.getAssegnatario())) i.setAssegnatario(null);
                    issueRepository.save(i);
                });

        // 5. Null out project creator reference
        progettiRepository.findAll().stream()
                .filter(p -> utente.equals(p.getIdCreatore()))
                .forEach(p -> {
                    p.setIdCreatore(null);
                    progettiRepository.save(p);
                });

        // 6. Finally delete the user
        utentiRepository.delete(utente);
    }

    public List<UtentiDTO> getUtentiByRuolo(TipoRuolo ruolo) {
        return utentiRepository.findByRuolo(ruolo)
                .stream()
                .map(UtentiDTO::new)
                .toList();
    }

    public boolean verificaPassword(String email, String password) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));
        return passwordEncoder.matches(password, utente.getPasswordHash());
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));

        return User.builder()
                .username(utente.getEmail())
                .password(utente.getPasswordHash())
                .roles(utente.getRuolo().name())
                .build();
    }
}
