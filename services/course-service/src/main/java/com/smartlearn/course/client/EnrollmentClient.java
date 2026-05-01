package com.smartlearn.course.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "enrollment-service")
public interface EnrollmentClient {
    @GetMapping("/api/enrollments/course/{courseId}/count")
    Long getCourseEnrollmentCount(@PathVariable("courseId") UUID courseId);
}
