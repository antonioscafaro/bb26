package com.bugboard25;

import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.tipo_ruolo; // Assicurati che l'import sia corretto
import com.bugboard25.repository.UtentiRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder; // Import fondamentale

@SpringBootApplication
public class BugBoard26Application {

	public static void main(String[] args) {
		SpringApplication.run(BugBoard26Application.class, args);
	}

	@Bean
	public CommandLineRunner demo(UtentiRepository repository, PasswordEncoder passwordEncoder) {
		return (args) -> {

			if (repository.count() == 0) {
				Utenti admin = new Utenti();
				admin.setEmail("admin@bugboard26.it");
				admin.setNome("Admin");
				admin.setCognome("Principale");


				admin.setPasswordHash(passwordEncoder.encode("admin123"));
				admin.setRuolo(tipo_ruolo.AMMINISTRATORE);

				repository.save(admin);
				System.out.println("Utente Admin generato con successo!");
			}

			System.out.println("------------------------------------------------");
			System.out.println("Utenti nel database:");
			repository.findAll().forEach(utente -> {
				System.out.println("Email: " + utente.getEmail() + ", Nome: " + utente.getNome());
			});
			System.out.println("------------------------------------------------");
		};
	}
}