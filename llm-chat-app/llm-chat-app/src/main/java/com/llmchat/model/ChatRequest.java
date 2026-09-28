package com.llmchat.model;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * Corpo recebido pelo endpoint POST /api/chat.
 * message: a nova mensagem do usuario
 * history: historico da conversa (opcional), usado para dar contexto ao LLM
 */
public record ChatRequest(
        @NotBlank(message = "A mensagem nao pode estar vazia")
        String message,
        List<ChatMessage> history
) {
}
