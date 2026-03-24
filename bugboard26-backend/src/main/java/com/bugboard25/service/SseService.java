package com.bugboard25.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {


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
        if (emitters.isEmpty()) return;

        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().comment("heartbeat"));
            } catch (IOException e) {
                emitters.remove(entry.getKey(), entry.getValue());
            }
        }
    }
}

