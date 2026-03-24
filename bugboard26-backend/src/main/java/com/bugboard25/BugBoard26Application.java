package com.bugboard25;

import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.TipoRuolo;
import com.bugboard25.repository.UtentiRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BugBoard26Application {


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
				admin.setRuolo(TipoRuolo.AMMINISTRATORE);

				repository.save(admin);
			}
		};
	}
}