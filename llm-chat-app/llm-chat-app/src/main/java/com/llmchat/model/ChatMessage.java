package com.llmchat.model;

/**
 * Representa uma mensagem trocada na conversa.
 * role: "user" ou "assistant"
 */
public record ChatMessage(String role, String content) {
}
