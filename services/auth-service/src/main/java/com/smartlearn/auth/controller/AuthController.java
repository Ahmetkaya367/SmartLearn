package com.smartlearn.auth.controller;

import com.smartlearn.auth.dto.AuthResponse;
import com.smartlearn.auth.dto.LoginRequest;
import com.smartlearn.auth.dto.RegisterRequest;
import com.smartlearn.auth.dto.UserAuthDetails;
import com.smartlearn.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam boolean active,
            @RequestParam String status) {
        authService.updateUserStatus(id, active, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/{id}/details")
    public ResponseEntity<UserAuthDetails> getUserAuthDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(authService.getUserAuthDetails(id));
    }

    @PostMapping("/users/{id}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable UUID id,
            @RequestBody Map<String, String> passwords) {
        authService.updatePassword(id, passwords.get("currentPassword"), passwords.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
