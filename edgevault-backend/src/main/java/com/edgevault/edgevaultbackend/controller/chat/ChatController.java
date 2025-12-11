package com.edgevault.edgevaultbackend.controller.chat;

import com.edgevault.edgevaultbackend.dto.chat.*;
import com.edgevault.edgevaultbackend.model.chat.ChatMessage;
import com.edgevault.edgevaultbackend.model.chat.Conversation;
import com.edgevault.edgevaultbackend.model.user.User;
import com.edgevault.edgevaultbackend.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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

    // --- NEW ENDPOINTS FOR CHAT UPGRADE ---

    @GetMapping("/api/v1/conversations")
    public ResponseEntity<List<ConversationSummaryDto>> getAllConversations(Authentication authentication) {
        List<ConversationSummaryDto> conversations = chatService.getAllConversations(authentication.getName());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/api/v1/conversations/group")
    public ResponseEntity<Conversation> getGroupConversation() {
        Conversation groupChat = chatService.getOrCreateGroupConversation();
        return ResponseEntity.ok(groupChat);
    }

    @PostMapping("/api/v1/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            Authentication authentication) {
        chatService.markConversationAsRead(conversationId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/v1/conversations/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        long count = chatService.getTotalUnreadCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/api/v1/users/search")
    public ResponseEntity<List<User>> searchUsers(
            @RequestParam(required = false) String query,
            Authentication authentication) {
        List<User> users = chatService.searchUsers(query != null ? query : "", authentication.getName());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/api/v1/users/{userId}/presence")
    public ResponseEntity<UserPresenceDto> getUserPresence(@PathVariable Long userId) {
        UserPresenceDto presence = chatService.getUserPresence(userId);
        return ResponseEntity.ok(presence);
    }

    @GetMapping("/api/v1/users/presence")
    public ResponseEntity<List<UserPresenceDto>> getAllPresences() {
        List<UserPresenceDto> presences = chatService.getAllUserPresences();
        return ResponseEntity.ok(presences);
    }

    // --- WEBSOCKET MESSAGE MAPPING FOR TYPING INDICATORS ---
    @MessageMapping("/chat/{conversationId}/typing")
    public void handleTypingIndicator(
            @DestinationVariable Long conversationId,
            @Payload TypingIndicatorDto typingIndicator,
            Principal principal) {
        typingIndicator.setUsername(principal.getName());
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId + "/typing", typingIndicator);
    }
}