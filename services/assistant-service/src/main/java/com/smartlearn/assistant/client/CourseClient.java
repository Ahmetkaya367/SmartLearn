package com.smartlearn.assistant.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "course-service")
public interface CourseClient {
    @GetMapping("/api/courses")
    List<Map<String, Object>> getAllCourses();

    @GetMapping("/api/courses/{id}")
    Map<String, Object> getCourseById(@PathVariable("id") UUID id);
}
