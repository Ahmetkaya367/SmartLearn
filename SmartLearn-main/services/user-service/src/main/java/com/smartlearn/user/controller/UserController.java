package com.smartlearn.user.controller;

import com.smartlearn.user.client.AuthClient;
import com.smartlearn.user.domain.UserProfile;
import com.smartlearn.user.dto.UserResponse;
import com.smartlearn.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
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
        return ResponseEntity.ok(userProfileRepository.findAll().stream()
                .map(profile -> UserResponse.builder()
                        .id(profile.getId())
                        .name(profile.getFullName())
                        .email(profile.getEmail())
                        .role("student") // Default for now
                        .avatar(profile.getAvatarUrl())
                        .status(profile.getStatus())
                        .build())
                .collect(Collectors.toList()));
    }

    @PostMapping("/{id}/ban")
    public ResponseEntity<Void> banUser(@PathVariable UUID id) {
        return userProfileRepository.findById(id)
                .map(profile -> {
                    profile.setStatus("BANNED");
                    userProfileRepository.save(profile);
                    authClient.updateUserStatus(id, false, "BANNED");
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        return userProfileRepository.findById(id)
                .map(profile -> {
                    profile.setStatus("ACTIVE");
                    userProfileRepository.save(profile);
                    authClient.updateUserStatus(id, true, "ACTIVE");
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
