package com.edgevault.edgevaultbackend.controller.chat;

import com.edgevault.edgevaultbackend.dto.chat.ChatMessageDto;
import com.edgevault.edgevaultbackend.dto.chat.NewChatMessageRequest;
import com.edgevault.edgevaultbackend.model.chat.ChatMessage;
import com.edgevault.edgevaultbackend.model.chat.Conversation;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{conversationId}")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            @Payload NewChatMessageRequest chatMessageRequest,
            Principal principal) {

        ChatMessage savedMessage = chatService.saveMessage(conversationId, chatMessageRequest.getContent(), principal.getName());
        ChatMessageDto messageDto = chatService.mapToChatMessageDto(savedMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, messageDto);
    }

    @GetMapping("/api/v1/conversations/{conversationId}/history")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable Long conversationId,
            Authentication authentication) {

        List<ChatMessageDto> history = chatService.getMessageHistory(conversationId, authentication.getName());
        return ResponseEntity.ok(history);
    }

    @PostMapping("/api/v1/conversations/dm")
    public ResponseEntity<Conversation> startDirectMessage(
            @RequestParam String withUser,
            Authentication authentication) {

        Conversation conversation = chatService.getOrCreateDirectConversation(authentication.getName(), withUser);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/api/v1/documents/{documentId}/conversation")
    public ResponseEntity<Conversation> getDocumentConversation(
            @PathVariable Long documentId,
            Authentication authentication) {

        Conversation conversation = chatService.getOrCreateDocumentConversation(documentId, authentication.getName());
        return ResponseEntity.ok(conversation);
    }
}