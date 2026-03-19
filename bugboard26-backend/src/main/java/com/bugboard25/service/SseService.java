package com.bugboard25.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private static final Logger logger = LoggerFactory.getLogger(SseService.class);

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
            logger.debug("SSE: Emitter completed for {}", email);
        });
        emitter.onTimeout(() -> {
            emitters.remove(email, emitter);
            logger.debug("SSE: Emitter timed out for {}", email);
        });
        emitter.onError(e -> {
            emitters.remove(email, emitter);
            logger.debug("SSE: Emitter error for {}: {}", email, e.getMessage());
        });

        logger.info("SSE: Subscribed {} (active emitters: {})", email, emitters.size());
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
                logger.debug("SSE: Send failed for {}, removed emitter", email);
            }
        }
    }

    public void sendUpdateSignal(String email, String eventName) {
        sendEvent(email, eventName, "UPDATE");
    }

    /**
     * Heartbeat: sends a comment-style ping every 30 seconds to keep
     * connections alive through proxies and firewalls.
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;

        int sent = 0;
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().comment("heartbeat"));
                sent++;
            } catch (IOException e) {
                emitters.remove(entry.getKey(), entry.getValue());
                logger.debug("SSE: Heartbeat failed for {}, removed emitter", entry.getKey());
            }
        }
        logger.debug("SSE: Heartbeat sent to {} active connections", sent);
    }
}

