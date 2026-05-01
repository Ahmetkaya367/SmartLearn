package com.smartlearn.enrollment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "course-service")
public interface CourseClient {

    @GetMapping("/api/courses/instructor/{instructorId}/ids")
    List<String> getInstructorCourseIds(@PathVariable("instructorId") String instructorId);

    @GetMapping("/api/courses/{id}")
    Map<String, Object> getCourseById(@PathVariable("id") String id);

    @org.springframework.web.bind.annotation.PostMapping("/api/courses/{id}/increment-student-count")
    void incrementStudentCount(@PathVariable("id") String id);
}