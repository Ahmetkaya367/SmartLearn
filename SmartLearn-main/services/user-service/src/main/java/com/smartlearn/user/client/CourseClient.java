package com.smartlearn.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "course-service")
public interface CourseClient {

    @GetMapping("/api/courses/stats")
    Map<String, Object> getCourseStats();

    @GetMapping("/api/courses/count")
    Long getTotalCourses();

    @GetMapping("/api/courses/instructor/{instructorId}/count")
    Long getInstructorCourseCount(@org.springframework.web.bind.annotation.PathVariable("instructorId") String instructorId);

    @GetMapping("/api/courses/instructor/{instructorId}/ids")
    List<String> getInstructorCourseIds(@org.springframework.web.bind.annotation.PathVariable("instructorId") String instructorId);

    @GetMapping("/api/courses/pending")
    List<Map<String, Object>> getPendingCourses();
}