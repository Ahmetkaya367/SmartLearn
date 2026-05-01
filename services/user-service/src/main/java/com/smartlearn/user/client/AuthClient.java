package com.smartlearn.user.client;

import com.smartlearn.user.dto.AuthUserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "auth-service")
public interface AuthClient {

    @PostMapping("/api/auth/users/{id}/status")
    void updateUserStatus(@PathVariable("id") UUID id, @RequestParam("active") boolean active,
            @RequestParam("status") String status);

    @GetMapping("/api/auth/users/{id}/details")
    AuthUserDto getUserDetails(@PathVariable("id") UUID id);
}

