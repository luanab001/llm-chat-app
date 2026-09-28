package com.llmchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Ponto de entrada da aplicacao.
 * Sobe um servidor web embutido (Tomcat) que serve:
 *  - a API REST em /api/chat
 *  - o front-end estatico (HTML/CSS/JS) em /
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class LlmChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(LlmChatApplication.class, args);
    }
}
