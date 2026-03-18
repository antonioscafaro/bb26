package com.bugboard25.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        logger.info("SSE: Subscribing user {}", email);
        emitters.put(email, emitter);

        emitter.onCompletion(() -> {
            logger.debug("SSE: Completed for user {}", email);
            emitters.remove(email);
        });
        emitter.onTimeout(() -> {
            logger.debug("SSE: Timeout for user {}", email);
            emitters.remove(email);
        });
        emitter.onError(e -> {
            logger.error("SSE: Error for user {}: {}", email, e.getMessage());
            emitters.remove(email);
        });

        return emitter;
    }

    public void sendEvent(String email, String eventName, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter != null) {
            try {
                logger.debug("SSE: Sending {} to {}", eventName, email);
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                logger.error("SSE: Failed to send event to {}", email);
                emitters.remove(email);
            }
        } else {
            logger.debug("SSE: No emitter found for user {}", email);
        }
    }

    public void sendUpdateSignal(String email, String eventName) {
        sendEvent(email, eventName, "UPDATE");
    }
}
