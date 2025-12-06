package com.edgevault.edgevaultbackend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // We expect the token to be in a native header named "Authorization" or as a query param
            // SockJS over HTTP might not support headers, so we check query params from the handshake.
            List<String> authorization = accessor.getNativeHeader("Authorization");
            String token = null;

            if (authorization != null && !authorization.isEmpty()) {
                token = authorization.get(0);
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
            } else {
                // Fallback for SockJS - check the query parameter from the handshake URL
                // Note: This relies on the native headers from the CONNECT frame.
                // Spring automatically copies query params from the handshake URL here.
                List<String> tokenParam = accessor.getNativeHeader("token");
                if (tokenParam != null && !tokenParam.isEmpty()) {
                    token = tokenParam.get(0);
                }
            }


            if (token != null) {
                try {
                    String username = jwtService.extractUsername(token);
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtService.isTokenValid(token, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(authToken); // IMPORTANT: Set the user for this WebSocket session
                            log.info("Authenticated WebSocket user: {}", username);
                        }
                    }
                } catch (Exception e) {
                    log.error("WebSocket authentication error: {}", e.getMessage());
                    // Optionally, you can throw an exception here to deny the connection
                }
            }
        }
        return message;
    }
}