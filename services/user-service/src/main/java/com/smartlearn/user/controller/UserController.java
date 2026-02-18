package com.smartlearn.user.controller;

import com.smartlearn.user.domain.UserProfile;
import com.smartlearn.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileRepository userProfileRepository;

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
}
