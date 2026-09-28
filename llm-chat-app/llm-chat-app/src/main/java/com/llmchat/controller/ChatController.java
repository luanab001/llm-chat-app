package com.llmchat.controller;

import com.llmchat.model.ChatRequest;
import com.llmchat.model.ChatResponse;
import com.llmchat.service.LlmService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * Endpoint principal consumido pelo front-end (js/app.js).
 */
@RestController
@RequestMapping("/api")
public class ChatController {

    private final LlmService llmService;

    public ChatController(LlmService llmService) {
        this.llmService = llmService;
    }

    @PostMapping("/chat")
    public Mono<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return llmService.gerarResposta(request.message(), request.history())
                .map(ChatResponse::new);
    }
}
