package com.bugboard25.controller;

import com.bugboard25.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}) // Allow both Create-React-App and Vite ports
public class SseController {

    @Autowired
    private SseService sseService;

    @GetMapping(path = "/subscribe/{email}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String email) {
        return sseService.subscribe(email);
    }
}
