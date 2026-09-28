# Nexus — Aplicação de Chat com LLM (Java + Spring Boot)

Aplicação full-stack em **Java** para conversar com um modelo de linguagem (LLM),
com back-end REST em Spring Boot e front-end web moderno, responsivo, com
transições e microinterações (efeito de "digitação", indicador de "pensando"
em forma de onda, glow no campo de texto, etc).

## Estrutura de arquivos

```
llm-chat-app/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/llmchat/
    │   ├── LlmChatApplication.java          # classe principal (main)
    │   ├── config/
    │   │   ├── CorsConfig.java              # libera CORS em /api/**
    │   │   └── LlmProperties.java           # binding de application.properties
    │   ├── controller/
    │   │   ├── ChatController.java          # POST /api/chat
    │   │   └── GlobalExceptionHandler.java  # respostas de erro em JSON
    │   ├── service/
    │   │   └── LlmService.java              # chamada HTTP ao provedor de LLM
    │   └── model/
    │       ├── ChatMessage.java             # record: role + content
    │       ├── ChatRequest.java             # record: message + history
    │       └── ChatResponse.java            # record: reply
    └── resources/
        ├── application.properties           # porta, chave de API, modelo
        └── static/
            ├── index.html                   # estrutura da interface
            ├── css/styles.css                # design tokens + animações
            └── js/app.js                     # lógica do chat no navegador
```

## Como executar

Pré-requisitos: **Java 17+** e **Maven 3.9+**.

1. Defina a chave de API do provedor de LLM (por padrão o serviço já está
   configurado para a Anthropic Messages API):

   ```bash
   export ANTHROPIC_API_KEY="sua-chave-aqui"
   ```

2. Rode a aplicação:

   ```bash
   mvn spring-boot:run
   ```

3. Abra `http://localhost:8080` no navegador. O próprio Spring Boot já serve
   o front-end estático em `src/main/resources/static`.

## Trocar de provedor de LLM

Toda a integração está isolada em `LlmService.java` e em `application.properties`
(`llm.api-url`, `llm.model`, `llm.api-key`). Para usar outro provedor
(OpenAI, um modelo local, etc.), basta:

1. Ajustar `llm.api-url` e `llm.model`.
2. Ajustar os cabeçalhos e o formato do corpo em `LlmService.gerarResposta`,
   caso o provedor use um contrato de API diferente.

## Design da interface

- **Paleta**: fundo tinta-noturna (`#0a0c12`) com gradiente de assinatura
  violeta → ciano, representando o "sinal" sendo gerado pelo modelo.
- **Tipografia**: Space Grotesk (títulos), Inter (corpo) e JetBrains Mono
  (detalhes técnicos, como o nome do modelo).
- **Elemento de assinatura**: uma "onda" animada (barras pulsantes) usada
  tanto na marca quanto no indicador de "digitando", remetendo à geração de
  tokens de um LLM.
- **Transições**: entrada de mensagens com fade + slide, glow de gradiente no
  campo de texto ao focar, alternância suave da barra lateral, efeito de
  "máquina de escrever" ao exibir a resposta do modelo.
- **Responsivo**: em telas até 860px a barra lateral vira um painel
  deslizante (off-canvas); em telas até 480px os elementos se compactam.
- Respeita `prefers-reduced-motion` para usuários sensíveis a animações.
