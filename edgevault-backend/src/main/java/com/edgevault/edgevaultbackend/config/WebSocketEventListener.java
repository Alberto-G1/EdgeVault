package com.edgevault.edgevaultbackend.config;

import com.edgevault.edgevaultbackend.dto.chat.UserPresenceDto;
import com.edgevault.edgevaultbackend.model.chat.UserPresence;
import com.edgevault.edgevaultbackend.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null) {
            String username = principal.getName();
            log.info("User connected: {}", username);
            
            try {
                // Update presence to ONLINE
                chatService.updateUserPresence(username, UserPresence.PresenceStatus.ONLINE);
                
                // Broadcast presence update
                Long userId = chatService.getUserByUsername(username).getId();
                UserPresenceDto presence = chatService.getUserPresence(userId);
                messagingTemplate.convertAndSend("/topic/presence", presence);
            } catch (Exception e) {
                log.error("Error updating presence for user: {}", username, e);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null) {
            String username = principal.getName();
            log.info("User disconnected: {}", username);
            
            try {
                // Update presence to OFFLINE
                chatService.updateUserPresence(username, UserPresence.PresenceStatus.OFFLINE);
                
                // Broadcast presence update
                Long userId = chatService.getUserByUsername(username).getId();
                UserPresenceDto presence = chatService.getUserPresence(userId);
                messagingTemplate.convertAndSend("/topic/presence", presence);
            } catch (Exception e) {
                log.error("Error updating presence for user: {}", username, e);
            }
        }
    }
}
