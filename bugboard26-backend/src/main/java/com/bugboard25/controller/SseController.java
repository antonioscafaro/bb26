package com.bugboard25.controller;

import com.bugboard25.service.SseService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final SseService sseService;

    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(path = "/subscribe/{email}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String email, HttpServletResponse response) {
        // Prevent proxy buffering (needed for Vercel, nginx, etc.)
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("Connection", "keep-alive");
        return sseService.subscribe(email);
    }
}
