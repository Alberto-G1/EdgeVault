package com.edgevault.edgevaultbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // These are destinations that the server will send messages to.
        // Clients will subscribe to these topics.
        registry.enableSimpleBroker("/topic");

        // This is the prefix for messages from clients to the server (e.g., to a @MessageMapping).
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the HTTP endpoint that clients will connect to for the WebSocket handshake.
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173") // Allow our frontend origin
                .withSockJS(); // Use SockJS for fallback options
    }
}