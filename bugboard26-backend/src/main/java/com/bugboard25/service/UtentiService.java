package com.bugboard25.service;


import com.bugboard25.dto.UtenteCreateRequestDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Date;

@Service
public class UtentiService implements UserDetailsService {
    @Autowired
    private UtentiRepository utentiRepository;

    @Autowired
    private ProgettiRepository progettiRepository;

    public List<UtentiDTO> getUtenti() {
        return utentiRepository.findAll()
                .stream()
                .map(UtentiDTO::new)
                .collect(Collectors.toList());
    }

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UtentiDTO> getUtentiByProgettoId(int progettoId) {
        Progetti progetto = progettiRepository.findById(progettoId)
                .orElseThrow(() -> new RuntimeException("Progetto non trovato"));

        return utentiRepository.findMembriByProgettoId(progetto.getId())
                .stream()
                .map(UtentiDTO::new)
                .collect(Collectors.toList());
    }

    public UtentiDTO getUtentiByEmail(String email) {
            System.out.println("Cercando utente con email: '" + email + "'");
            Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> {
                    System.out.println("Utente non trovato per email: '" + email + "'");
                    return new RuntimeException("Utente non trovato");
                });
            return new UtentiDTO(utente);
    }

    public UtentiDTO creaUtente(UtenteCreateRequestDTO requestDTO) {
        if (utentiRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email già registrata");
        }

        Utenti utente = new Utenti();
        utente.setNome(requestDTO.getNome());
        utente.setCognome(requestDTO.getCognome());
        utente.setEmail(requestDTO.getEmail());

        String passwordHash = passwordEncoder.encode(requestDTO.getPassword());
        utente.setPasswordHash(passwordHash);

        utente.setRuolo(requestDTO.getRuolo());
        utente.setData_creazione(new Date());



        Utenti utenteSalvato = utentiRepository.save(utente);
        return new UtentiDTO(utenteSalvato);
    }

    public UtentiDTO updateUtenteByEmail(String email, UtenteCreateRequestDTO requestDTO) {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

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
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        utentiRepository.delete(utente);
    }

    public List<UtentiDTO> getUtentiByRuolo(tipo_ruolo ruolo) {
        return utentiRepository.findByRuolo(ruolo)
                .stream()
                .map(UtentiDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utenti utente = utentiRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        return User.builder()
                .username(utente.getEmail())
                .password(utente.getPasswordHash())
                .roles(utente.getRuolo().name())
                .build();
    }
}
