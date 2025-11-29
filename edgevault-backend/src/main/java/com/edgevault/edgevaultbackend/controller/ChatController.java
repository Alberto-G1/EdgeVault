package com.edgevault.edgevaultbackend.controller.chat;

import com.edgevault.edgevaultbackend.dto.chat.ChatMessageDto;
import com.edgevault.edgevaultbackend.dto.chat.NewChatMessageRequest;
import com.edgevault.edgevaultbackend.model.chat.ChatMessage;
import com.edgevault.edgevaultbackend.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handles new chat messages sent over WebSocket.
     * Clients send messages to "/app/chat/{documentId}".
     * The server broadcasts the saved message to "/topic/chat/{documentId}".
     */
    @MessageMapping("/chat/{documentId}")
    public void sendMessage(
            @DestinationVariable Long documentId,
            @Payload NewChatMessageRequest chatMessageRequest,
            Principal principal) {

        // Save the message to the database
        ChatMessage savedMessage = chatService.saveMessage(documentId, chatMessageRequest.getContent(), principal.getName());

        // Convert to DTO to broadcast
        ChatMessageDto messageDto = chatService.mapToChatMessageDto(savedMessage);

        // Broadcast the new message to all subscribers of this document's chat topic
        messagingTemplate.convertAndSend("/topic/chat/" + documentId, messageDto);
    }

    /**
     * An HTTP endpoint to fetch the chat history for a document.
     * This is called once when the client first loads the chat.
     */
    @GetMapping("/api/v1/documents/{documentId}/chat-history")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable Long documentId,
            Authentication authentication) {

        List<ChatMessageDto> history = chatService.getMessageHistory(documentId, authentication.getName());
        return ResponseEntity.ok(history);
    }
}