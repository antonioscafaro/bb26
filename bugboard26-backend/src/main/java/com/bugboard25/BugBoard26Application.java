package com.bugboard25;

import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import com.bugboard25.repository.UtentiRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BugBoard26Application {

	private static final Logger logger = LoggerFactory.getLogger(BugBoard26Application.class);

	public static void main(String[] args) {
		SpringApplication.run(BugBoard26Application.class, args);
	}

	@Bean
	public CommandLineRunner demo(UtentiRepository repository, PasswordEncoder passwordEncoder) {
		return args -> {

			if (repository.count() == 0) {
				Utenti admin = new Utenti();
				admin.setEmail("admin@bugboard26.it");
				admin.setNome("Admin");
				admin.setCognome("Principale");

				String adminPassword = System.getenv("ADMIN_PASSWORD");
				if (adminPassword == null || adminPassword.isEmpty()) {
					adminPassword = "admin123";
				}
				admin.setPasswordHash(passwordEncoder.encode(adminPassword));
				admin.setRuolo(tipo_ruolo.AMMINISTRATORE);

				repository.save(admin);
				logger.info("Utente Admin generato con successo!");
			}

			logger.info("------------------------------------------------");
			logger.info("Utenti nel database:");
			repository.findAll().forEach(utente ->
				logger.info("Email: {}, Nome: {}", utente.getEmail(), utente.getNome())
			);
			logger.info("------------------------------------------------");
		};
	}
}