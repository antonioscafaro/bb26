package com.bugboard25;

import com.bugboard25.repository.UtentiRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BugBoard26Application {

	public static void main(String[] args) {
		SpringApplication.run(BugBoard26Application.class, args);
	}

	@Bean
	public CommandLineRunner demo(UtentiRepository repository) {
		return (args) -> {
			System.out.println("------------------------------------------------");
			System.out.println("Utenti nel database:");
			repository.findAll().forEach(utente -> {
				System.out.println("Email: " + utente.getEmail() + ", Nome: " + utente.getNome());
			});
			System.out.println("------------------------------------------------");
		};
	}

}
