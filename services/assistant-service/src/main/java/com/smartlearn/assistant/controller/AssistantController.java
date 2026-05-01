package com.smartlearn.assistant.controller;

import com.smartlearn.assistant.service.AssistantService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final AssistantService assistantService;

    public AssistantController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @GetMapping("/recommendations")
    public Map<String, String> getRecommendations(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId) {
        
        System.out.println("DEBUG: Incoming Header X-User-Id: [" + headerUserId + "]");
        System.out.println("DEBUG: Incoming Param userId: [" + paramUserId + "]");
        
        String userId = (headerUserId != null && !headerUserId.isBlank()) ? headerUserId : paramUserId;
        String response = assistantService.getRecommendations(userId);
        return Map.of("message", response);
    }

    @PostMapping("/chat")
    public Map<String, String> chat(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId,
            @RequestBody Map<String, String> body) {
        
        System.out.println("DEBUG CHAT: Incoming Header X-User-Id: [" + headerUserId + "]");
        System.out.println("DEBUG CHAT: Incoming Param userId: [" + paramUserId + "]");
        
        String userId = (headerUserId != null && !headerUserId.isBlank()) ? headerUserId : paramUserId;
        String userMessage = body.get("message");
        String response = assistantService.chat(userMessage, userId);
        return Map.of("message", response);
    }
}
