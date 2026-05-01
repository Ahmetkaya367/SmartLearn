package com.smartlearn.user.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlearn.user.domain.UserProfile;
import com.smartlearn.user.dto.UserCreatedEvent;
import com.smartlearn.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventHandler {

    private final UserProfileRepository userProfileRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user.created", groupId = "user-service-group")
    public void handleUserCreated(String message) {
        log.info("Received user.created event: {}", message);
        
        try {
            UserCreatedEvent event = objectMapper.readValue(message, UserCreatedEvent.class);
            log.info("Parsed event for userId: {}, email: {}, name: {}",
                    event.getId(), event.getEmail(), event.getFullName());

            UUID id = UUID.fromString(event.getId());

            if (!userProfileRepository.existsById(id)) {
                LocalDateTime now = LocalDateTime.now();
                UserProfile profile = UserProfile.builder()
                        .id(id)
                        .email(event.getEmail())
                        .fullName(event.getFullName())
                        .role(event.getRole())
                        .status("ACTIVE")
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
                userProfileRepository.save(profile);
                log.info("Created profile for userId: {} with name: {}", event.getId(), event.getFullName());
            } else {
                log.info("Profile already exists for userId: {}", event.getId());
            }
        } catch (Exception e) {
            log.error("Error processing user.created event: {}", e.getMessage());
            // Fallback for old simple String userId if it's not JSON
            try {
                UUID id = UUID.fromString(message);
                if (!userProfileRepository.existsById(id)) {
                    LocalDateTime now = LocalDateTime.now();
                    UserProfile profile = UserProfile.builder()
                            .id(id)
                            .email("pending-" + id + "@smartlearn.com")
                            .fullName("New User")
                            .status("ACTIVE")
                            .createdAt(now)
                            .updatedAt(now)
                            .build();
                    userProfileRepository.save(profile);
                    log.info("Created fallback profile for userId: {}", id);
                }
            } catch (Exception ex) {
                log.error("Could not parse message as UUID either: {}", message);
            }
        }
    }
}
