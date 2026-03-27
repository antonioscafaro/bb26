package com.bugboard25.service;

import com.bugboard25.dto.UtentiDTO;
import com.bugboard25.entity.Progetti;
import com.bugboard25.entity.ProgettoMembri;
import com.bugboard25.entity.enumerations.TipoRuolo;
import com.bugboard25.repository.ProgettiRepository;
import com.bugboard25.repository.ProgettoMembriRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final ProgettiRepository progettiRepository;
    private final ProgettoMembriRepository progettoMembriRepository;
    private final UtentiService utentiService;

    public SseService(ProgettiRepository pr, ProgettoMembriRepository prm, UtentiService u) {
        progettiRepository = pr;
        progettoMembriRepository = prm;
        utentiService = u;
    }

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email) {
        // Complete old emitter first (clean handoff)
        SseEmitter oldEmitter = emitters.get(email);
        if (oldEmitter != null) {
            try {
                oldEmitter.complete();
            } catch (Exception e) {
                // Ignore — old emitter may already be completed/errored
            }
        }

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(email, emitter);

        // CRITICAL: use remove(key, value) to avoid race condition
        // where the OLD emitter's callback removes the NEW emitter
        emitter.onCompletion(() -> {
            emitters.remove(email, emitter);
        });
        emitter.onTimeout(() -> {
            emitters.remove(email, emitter);
        });
        emitter.onError(e -> {
            emitters.remove(email, emitter);
        });

        // Send initial event immediately to flush proxy buffers
        // and confirm the connection is alive
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            emitters.remove(email, emitter);
        }

        return emitter;
    }

    public void sendEvent(String email, String eventName, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                emitters.remove(email, emitter);
            }
        }
    }

    public void sendUpdateSignal(String email, String eventName) {
        sendEvent(email, eventName, "UPDATE");
    }

    /**
     * Heartbeat: sends a comment-style ping every 15 seconds to keep
     * connections alive through proxies and firewalls.
     */
    @Scheduled(fixedRate = 15000)
    public void sendHeartbeat() {
        if (emitters.isEmpty())
            return;

        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().comment("heartbeat"));
            } catch (IOException e) {
                emitters.remove(entry.getKey(), entry.getValue());
            }
        }
    }

    /**
     * Notifica tutti i membri del progetto e gli amministratori via SSE.
     */
    public void notifyProjectMembers(int projectId, String eventName) {
        try {
            java.util.Set<String> emailsDaNotificare = collectProjectEmails(projectId);

            for (String email : emailsDaNotificare) {
                sendUpdateSignal(email, eventName);
            }
        } catch (Exception e) {
            // SSE broadcast failure is non-critical
        }
    }

    /**
     * Notifica tutti i membri del progetto, gli amministratori, e un utente aggiuntivo via SSE.
     * Utile per i cambi di membership dove l'utente rimosso deve comunque essere notificato.
     */
    public void notifyProjectMembers(int projectId, String eventName, String extraEmail) {
        try {
            java.util.Set<String> emailsDaNotificare = collectProjectEmails(projectId);
            emailsDaNotificare.add(extraEmail);

            for (String email : emailsDaNotificare) {
                sendUpdateSignal(email, eventName);
            }
        } catch (Exception e) {
            // SSE broadcast failure is non-critical
        }
    }

    /**
     * Raccoglie le email di tutti i membri del progetto e degli amministratori.
     * Utile quando le email devono essere raccolte prima di una cancellazione a cascata.
     */
    public java.util.Set<String> collectProjectEmails(int projectId) {
        java.util.Set<String> emails = new java.util.LinkedHashSet<>();
        try {
            Optional<Progetti> progettoOpt = progettiRepository.findById(projectId);
            if (progettoOpt.isPresent()) {
                List<ProgettoMembri> membri = progettoMembriRepository.findByProgetto(progettoOpt.get());
                for (ProgettoMembri membro : membri) {
                    emails.add(membro.getUtente().getEmail());
                }
            }
            List<UtentiDTO> amministratori = utentiService.getUtentiByRuolo(TipoRuolo.AMMINISTRATORE);
            for (UtentiDTO amministratore : amministratori) {
                emails.add(amministratore.getEmail());
            }
        } catch (Exception e) {
            // Email collection failure is non-critical
        }
        return emails;
    }

    /**
     * Notifica una lista di email già raccolta.
     */
    public void notifyEmails(java.util.Set<String> emails, String eventName) {
        try {
            for (String email : emails) {
                sendUpdateSignal(email, eventName);
            }
        } catch (Exception e) {
            // SSE notification failure is non-critical
        }
    }
}
