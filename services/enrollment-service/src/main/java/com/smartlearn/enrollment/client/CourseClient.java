package com.smartlearn.enrollment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "course-service")
public interface CourseClient {

    @GetMapping("/api/courses/instructor/{instructorId}/ids")
    List<String> getInstructorCourseIds(@PathVariable("instructorId") String instructorId);
}