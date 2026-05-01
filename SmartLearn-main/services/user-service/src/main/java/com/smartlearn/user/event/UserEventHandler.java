package com.smartlearn.user.event;

import com.smartlearn.user.domain.UserProfile;
import com.smartlearn.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventHandler {

    private final UserProfileRepository userProfileRepository;

    @KafkaListener(topics = "user.created", groupId = "user-service-group")
    public void handleUserCreated(String userId) {
        log.info("Received user.created event for userId: {}", userId);
        UUID id = UUID.fromString(userId);

        if (!userProfileRepository.existsById(id)) {
            UserProfile profile = UserProfile.builder()
                    .id(id)
                    // email and fullName should ideally be in the event payload
                    // but for this skeleton we illustrate the flow
                    .email("pending@temp.com")
                    .fullName("New User")
                    .build();
            userProfileRepository.save(profile);
            log.info("Created profile for userId: {}", userId);
        }
    }
}
