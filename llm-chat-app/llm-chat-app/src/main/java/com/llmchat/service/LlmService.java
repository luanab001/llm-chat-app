package com.llmchat.service;

import com.llmchat.config.LlmProperties;
import com.llmchat.model.ChatMessage;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Encapsula a chamada HTTP para a API do provedor de LLM.
 * O formato do corpo abaixo segue o padrao "messages" (role/content),
 * usado pela Anthropic Messages API — troque a URL/modelo em
 * application.properties para apontar para outro provedor compativel.
 */
@Service
public class LlmService {

    private final WebClient webClient;
    private final LlmProperties properties;

    public LlmService(WebClient.Builder webClientBuilder, LlmProperties properties) {
        this.properties = properties;
        this.webClient = webClientBuilder
                .baseUrl(properties.getApiUrl())
                .build();
    }

    /**
     * Envia a mensagem do usuario + historico para o LLM e retorna a resposta em texto.
     */
    public Mono<String> gerarResposta(String novaMensagem, List<ChatMessage> historico) {
        List<Map<String, String>> mensagens = new ArrayList<>();

        if (historico != null) {
            for (ChatMessage m : historico) {
                mensagens.add(Map.of("role", m.role(), "content", m.content()));
            }
        }
        mensagens.add(Map.of("role", "user", "content", novaMensagem));

        Map<String, Object> corpo = Map.of(
                "model", properties.getModel(),
                "max_tokens", properties.getMaxTokens(),
                "system", properties.getSystemPrompt(),
                "messages", mensagens
        );

        return webClient.post()
                .uri("")
                .header("x-api-key", properties.getApiKey())
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(corpo)
                .retrieve()
                .bodyToMono(Map.class)
                .map(this::extrairTexto);
    }

    @SuppressWarnings("unchecked")
    private String extrairTexto(Map<String, Object> respostaBruta) {
        List<Map<String, Object>> conteudo = (List<Map<String, Object>>) respostaBruta.get("content");
        if (conteudo == null || conteudo.isEmpty()) {
            return "";
        }
        Object texto = conteudo.get(0).get("text");
        return texto != null ? texto.toString() : "";
    }
}
