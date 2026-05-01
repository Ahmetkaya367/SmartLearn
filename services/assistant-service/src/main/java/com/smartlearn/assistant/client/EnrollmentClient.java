package com.smartlearn.assistant.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "enrollment-service")
public interface EnrollmentClient {
    @GetMapping("/api/enrollments/user/{userId}/progress")
    List<Map<String, Object>> getUserProgress(@PathVariable("userId") UUID userId);
}
