package com.smartlearn.user.controller;

import com.smartlearn.user.client.AuthClient;
import com.smartlearn.user.domain.UserProfile;
import com.smartlearn.user.dto.AuthUserDto;
import com.smartlearn.user.dto.UserResponse;
import com.smartlearn.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserProfileRepository userProfileRepository;
    private final AuthClient authClient;

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable UUID id) {
        return userProfileRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable UUID id, @RequestBody UserProfile profile) {
        return userProfileRepository.findById(id)
                .map(existing -> {
                    existing.setFullName(profile.getFullName());
                    existing.setBio(profile.getBio());
                    existing.setAvatarUrl(profile.getAvatarUrl());
                    return ResponseEntity.ok(userProfileRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Fetching all user profiles...");
        List<UserProfile> profiles = userProfileRepository.findAll();

        List<UserResponse> users = profiles.stream()
            .map(profile -> {
                // First try to use the role stored in UserProfile (populated at registration)
                String role = profile.getRole();
                String status = profile.getStatus();

                // If role not in UserProfile, fall back to AuthClient (now uses Eureka directly)
                if (role == null || role.isBlank()) {
                    try {
                        AuthUserDto authDetail = authClient.getUserDetails(profile.getId());
                        if (authDetail != null && authDetail.getRole() != null) {
                            role = authDetail.getRole().replace("ROLE_", "").toLowerCase();
                        }
                        if (authDetail != null && authDetail.getStatus() != null) {
                            status = authDetail.getStatus();
                        }
                    } catch (Exception e) {
                        log.warn("Auth lookup failed for user {}: {}", profile.getId(), e.getMessage());
                        role = "student"; // final fallback
                    }
                } else {
                    role = role.replace("ROLE_", "").toLowerCase();
                }

                return UserResponse.builder()
                    .id(profile.getId())
                    .name(profile.getFullName())
                    .email(profile.getEmail())
                    .role(role)
                    .avatar(profile.getAvatarUrl())
                    .status(status)
                    .build();
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @PostMapping("/{id}/ban")
    public ResponseEntity<Void> banUser(@PathVariable UUID id) {
        log.info("Ban user request received for ID: {}", id);
        return userProfileRepository.findById(id)
                .map(profile -> {
                    profile.setStatus("BANNED");
                    userProfileRepository.save(profile);
                    try {
                        authClient.updateUserStatus(id, false, "BANNED");
                        log.info("Ban successful for user: {}", id);
                    } catch (Exception e) {
                        log.error("Auth-service sync failed for ban on user {}: {}", id, e.getMessage());
                    }
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        log.info("Activate user request received for ID: {}", id);
        return userProfileRepository.findById(id)
                .map(profile -> {
                    profile.setStatus("ACTIVE");
                    userProfileRepository.save(profile);
                    try {
                        authClient.updateUserStatus(id, true, "ACTIVE");
                        log.info("Activation successful for user: {}", id);
                    } catch (Exception e) {
                        log.error("Auth-service sync failed for activate on user {}: {}", id, e.getMessage());
                    }
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
