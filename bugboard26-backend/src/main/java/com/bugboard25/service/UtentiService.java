package com.bugboard25.service;

import com.bugboard25.dto.UtenteCreateRequestDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.exception.BadRequestException;
import com.bugboard25.exception.ErrorMessages;
import com.bugboard25.exception.ResourceNotFoundException;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.UtentiRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.bugboard25.entity.enumerations.TipoRuolo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Date;

@Service
public class UtentiService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UtentiService.class);

    private final UtentiRepository utentiRepository;
    private final ProgettiRepository progettiRepository;
    private final PasswordEncoder passwordEncoder;

    public UtentiService(UtentiRepository utentiRepository, ProgettiRepository progettiRepository,
                         PasswordEncoder passwordEncoder) {
        this.utentiRepository = utentiRepository;
        this.progettiRepository = progettiRepository;
        this.passwordEncoder = passwordEncoder;
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
            logger.debug("Cercando utente con email: '{}'", email);
            Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> {
                    logger.debug("Utente non trovato per email: '{}'", email);
                    return new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO);
                });
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

    public void deleteUtenteByEmail(String email) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.UTENTE_NON_TROVATO));
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
