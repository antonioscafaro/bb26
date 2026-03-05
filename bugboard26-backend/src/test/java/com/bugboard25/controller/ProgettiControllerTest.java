package com.bugboard25.controller;

import com.bugboard25.dto.ProgettiDTO;
import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.Utenti;
import com.bugboard25.entity.enumerations.tipo_ruolo;
import com.bugboard25.service.ProgettiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest // Avvia un contesto Spring Boot
@AutoConfigureMockMvc // Configura MockMvc per simulare le chiamate HTTP
class ProgettiControllerTest {

    @Autowired
    private MockMvc mockMvc; // Lo strumento per fare le chiamate HTTP

    // 1. Mocka i Service (non vogliamo testare il service, solo il controller)
    @MockBean
    private ProgettiService progettiService;
    // Nota: Se il controller usa altri service, devi mockare anche quelli
    // @MockBean private UtentiService utentiService; ... etc.

    
    // 2. Simula un utente autenticato!
    // Questo è FONDAMENTALE perché i tuoi endpoint sono protetti
    @Test
    @WithMockUser(username = "utente@test.com", roles = {"UTENTE"})
    void testGetProgettiById_Success() throws Exception {

        // ARRANGE (Preparazione)

        // 1. Crea un finto utente (l'Entità)
        Utenti fintoCreatore = new Utenti();
        fintoCreatore.setEmail("creatore@test.com");
        fintoCreatore.setNome("NomeCreatore");
        fintoCreatore.setCognome("CognomeCreatore");
        fintoCreatore.setRuolo(tipo_ruolo.UTENTE);
        // (Non serve la password, il DTO la ignora)

        // 2. Crea un finto progetto (l'Entità)
        Progetti fintoProgetto = new Progetti();
        fintoProgetto.setId(1);
        fintoProgetto.setNome("Progetto Test");
        fintoProgetto.setDescrizione("Descrizione test");
        fintoProgetto.setData_creazione(new Date());
        fintoProgetto.setId_creatore(fintoCreatore); // Collega il creatore finto

        // 3. Crea il DTO REALE che il service restituirà
        // Questo simula esattamente quello che fa il tuo ProgettiService
        ProgettiDTO progettoDtoDaRestituire = new ProgettiDTO(fintoProgetto);

        // 4. Definisci il comportamento del service mockato
        // "Quando il service viene chiamato con ID 1, restituisci il nostro DTO"
        when(progettiService.getProgettiById(1)).thenReturn(progettoDtoDaRestituire);

        // ACT & ASSERT (Esegui e Controlla)
        mockMvc.perform(get("/api/progetti/id/1")) // Esegui la chiamata GET
                .andExpect(status().isOk()) // Ci aspettiamo HTTP 200
                .andExpect(jsonPath("$.id").value(1)) // Controlla l'ID nel JSON
                .andExpect(jsonPath("$.nome").value("Progetto Test")) // Controlla il nome
                .andExpect(jsonPath("$.creatore.email").value("creatore@test.com")); // Controlla l'email annidata
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"AMMINISTRATORE"})
    void testCreaProgetto_AdminAccess() throws Exception {
        // Qui testeresti un endpoint POST.
        // Dovrai simulare l'invio di un corpo JSON
        // e usare @WithMockUser(roles = {"AMMINISTRATORE"})
        // per i test di sicurezza
        // Esempio: .perform(post("/api/progetti").contentType(MediaType.APPLICATION_JSON).content("...il tuo JSON..."))
    }

    @Test
    void testGetProgettiById_Unauthorized() throws Exception {
        // ARRANGE (Non serve, non siamo autenticati)

        // ACT & ASSERT
        // Esegui la chiamata SENZA @WithMockUser
        mockMvc.perform(get("/api/progetti/id/1"))
                .andExpect(status().isUnauthorized()); // Ci aspettiamo 401 Unauthorized
    }
}