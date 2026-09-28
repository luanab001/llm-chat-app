package com.llmchat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Mapeia o prefixo "llm.*" do application.properties.
 * Mantem as credenciais e parametros do provedor de LLM fora do codigo.
 */
@ConfigurationProperties(prefix = "llm")
public class LlmProperties {

    /** URL do endpoint de chat do provedor (ex: https://api.anthropic.com/v1/messages) */
    private String apiUrl;

    /** Chave de API do provedor, lida de variavel de ambiente */
    private String apiKey;

    /** Nome/versao do modelo a ser usado */
    private String model;

    /** Numero maximo de tokens na resposta */
    private int maxTokens = 1024;

    /** Instrucao de sistema enviada em toda conversa */
    private String systemPrompt = "Voce e um assistente util, direto e cordial.";

    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }

    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }
}
