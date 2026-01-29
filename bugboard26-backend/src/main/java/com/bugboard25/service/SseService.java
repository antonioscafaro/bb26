package com.bugboard25.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email) {
        // Timeout indefinito per connessione persistente
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        System.out.println("SSE: Subscribing user " + email);
        emitters.put(email, emitter);

        emitter.onCompletion(() -> {
            System.out.println("SSE: Completed for user " + email);
            emitters.remove(email);
        });
        emitter.onTimeout(() -> {
            System.out.println("SSE: Timeout for user " + email);
            emitters.remove(email);
        });
        emitter.onError((e) -> {
            System.err.println("SSE: Error for user " + email + ": " + e.getMessage());
            emitters.remove(email);
        });

        return emitter;
    }

    public void sendEvent(String email, String eventName, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter != null) {
            try {
                System.out.println("SSE: Sending " + eventName + " to " + email);
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                System.err.println("SSE: Failed to send event to " + email);
                emitters.remove(email);
            }
        } else {
             System.out.println("SSE: No emitter found for user " + email);
        }
    }
    
    // Metodo overload per inviare solo segnale di aggiornamento senza payload
    public void sendUpdateSignal(String email, String eventName) {
        sendEvent(email, eventName, "UPDATE");
    }
}
