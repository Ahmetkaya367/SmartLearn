package com.smartlearn.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "enrollment-service")
public interface EnrollmentClient {

    @GetMapping("/api/enrollments/stats")
    Map<String, Object> getEnrollmentStats();

    @GetMapping("/api/enrollments/count")
    Long getTotalEnrollments();

    @GetMapping("/api/enrollments/distinct-users")
    Long getDistinctUserCount();

    @GetMapping("/api/enrollments/user/{userId}/progress")
    List<Map<String, Object>> getUserProgress(@PathVariable("userId") UUID userId);

    @GetMapping("/api/enrollments/user/{userId}/learning-time")
    Integer getLearningTime(@PathVariable("userId") UUID userId);

    @GetMapping("/api/enrollments/instructor/{instructorId}/stats")
    Map<String, Object> getInstructorEnrollmentStats(@PathVariable String instructorId);

    @GetMapping("/api/enrollments/course/{courseId}/count")
    Long getCourseEnrollmentCount(@PathVariable String courseId);

    @GetMapping("/api/enrollments/instructor/{instructorId}/students")
    List<Map<String, Object>> getInstructorStudents(@PathVariable UUID instructorId);

    @GetMapping("/api/enrollments/student/{studentId}/instructors")
    List<String> getStudentInstructors(@PathVariable UUID studentId);

    @GetMapping("/api/enrollments/user/{userId}/certificates/count")
    Long getCertificateCount(@PathVariable("userId") UUID userId);
}
