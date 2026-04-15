package com.smartlearn.auth.service;

import com.smartlearn.auth.domain.User;
import com.smartlearn.auth.dto.AuthResponse;
import com.smartlearn.auth.dto.LoginRequest;
import com.smartlearn.auth.dto.RegisterRequest;
import com.smartlearn.auth.repository.UserRepository;
import com.smartlearn.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.isActive() || "BANNED".equals(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Hesabınız banlanmıştır 1 gün sonra yeniden deneyin");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        String role = userDetails.getAuthorities().stream().findFirst().map(a -> a.getAuthority())
                .orElse("ROLE_STUDENT");

        // Publish Login Event
        kafkaTemplate.send("auth.login", request.getEmail());

        return AuthResponse.builder()
                .id(user.getId().toString())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .avatarUrl(null)
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? "ROLE_" + request.getRole() : "ROLE_STUDENT")
                .active(true)
                .status("ACTIVE")
                .build();

        userRepository.save(user);

        // Publish User Created Event
        kafkaTemplate.send("user.created", user.getId().toString());

        return login(new LoginRequest(request.getEmail(), request.getPassword()));
    }

    public void updateUserStatus(UUID id, boolean active, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(active);
        user.setStatus(status);
        userRepository.save(user);
    }
}
