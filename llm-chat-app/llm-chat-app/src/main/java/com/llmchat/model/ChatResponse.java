package com.llmchat.model;

/**
 * Corpo retornado pelo endpoint POST /api/chat.
 */
public record ChatResponse(String reply) {
}
