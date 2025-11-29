package com.edgevault.edgevaultbackend.dto.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewChatMessageRequest {
    @NotBlank(message = "Content cannot be blank")
    private String content;
}