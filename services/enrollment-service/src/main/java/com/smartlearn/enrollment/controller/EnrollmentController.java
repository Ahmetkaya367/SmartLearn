package com.smartlearn.enrollment.controller;

import com.smartlearn.enrollment.client.CourseClient;
import com.smartlearn.enrollment.client.UserClient;
import com.smartlearn.enrollment.domain.Enrollment;
import com.smartlearn.enrollment.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Slf4j
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseClient courseClient;
    private final UserClient userClient;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEnrollmentStats() {
        long totalEnrollments = enrollmentRepository.countTotalEnrollments();
        long distinctUsers = enrollmentRepository.countDistinctUsers();

        return ResponseEntity.ok(Map.of(
                "totalEnrollments", totalEnrollments,
                "distinctUsers", distinctUsers
        ));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalEnrollments() {
        return ResponseEntity.ok(enrollmentRepository.countTotalEnrollments());
    }

    @GetMapping("/distinct-users")
    public ResponseEntity<Long> getDistinctUserCount() {
        return ResponseEntity.ok(enrollmentRepository.countDistinctUsers());
    }

    @GetMapping("/user/{userId}/progress")
    public ResponseEntity<List<Map<String, Object>>> getUserProgress(@PathVariable UUID userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        List<Map<String, Object>> progress = enrollments.stream()
                .map(enrollment -> Map.<String, Object>of(
                        "courseId", enrollment.getCourseId().toString(),
                        "progress", enrollment.getProgressPercent(),
                        "lastAccessed", enrollment.getLastAccessedAt() != null ? enrollment.getLastAccessedAt().toString() : null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(progress);
    }

    @GetMapping("/course/{courseId}/count")
    public ResponseEntity<Long> getCourseEnrollmentCount(@PathVariable UUID courseId) {
        return ResponseEntity.ok(enrollmentRepository.countByCourseId(courseId));
    }

    @GetMapping("/instructor/{instructorId}/stats")
    public ResponseEntity<Map<String, Object>> getInstructorEnrollmentStats(@PathVariable UUID instructorId) {
        List<String> courseIds = courseClient.getInstructorCourseIds(instructorId.toString());
        long totalStudents = courseIds.stream()
                .map(UUID::fromString)
                .mapToLong(enrollmentRepository::countByCourseId)
                .sum();

        long courseCount = courseIds.size();
        long totalEnrollments = courseIds.stream()
                .map(UUID::fromString)
                .mapToLong(enrollmentRepository::countByCourseId)
                .sum();

        double estimatedRevenue = totalEnrollments * 49.99; // placeholder

        return ResponseEntity.ok(Map.of(
                "courseCount", courseCount,
                "totalStudents", totalStudents,
                "totalEnrollments", totalEnrollments,
                "estimatedRevenue", estimatedRevenue
        ));
    }

    @GetMapping("/instructor/{instructorId}/students")
    public ResponseEntity<List<Map<String, Object>>> getInstructorStudents(@PathVariable UUID instructorId) {
        log.info("Request received: Fetching students for instructor {}", instructorId);
        try {
            List<String> courseIds;
            try {
                courseIds = courseClient.getInstructorCourseIds(instructorId.toString());
                log.info("API CALL: getInstructorCourseIds for {} returned {} courses", instructorId, courseIds.size());
            } catch (Exception e) {
                log.error("API ERROR: Failed to call course-service for instructor {}: {}", instructorId, e.getMessage());
                return ResponseEntity.status(503).build();
            }

            if (courseIds.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<UUID> courseUUIDs = courseIds.stream()
                    .map(id -> {
                        try {
                            return UUID.fromString(id);
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            List<Enrollment> enrollments = enrollmentRepository.findAllByCourseIdIn(courseUUIDs);
            log.info("DB QUERY: Found {} enrollments for instructor courses", enrollments.size());
            
            List<Map<String, Object>> students = enrollments.stream().map(enrollment -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", enrollment.getId());
                data.put("userId", enrollment.getUserId());
                data.put("courseId", enrollment.getCourseId());
                data.put("progressPercent", enrollment.getProgressPercent()); 
                data.put("lastAccessedAt", enrollment.getLastAccessedAt());

                try {
                    Map<String, Object> userProfile = userClient.getUserProfile(enrollment.getUserId());
                    if (userProfile != null) {
                        data.put("studentName", userProfile.get("fullName"));
                        data.put("studentEmail", userProfile.get("email"));
                    }
                } catch (Exception e) {
                    log.warn("API WARN: Could not fetch profile for user {}: {}", enrollment.getUserId(), e.getMessage());
                    data.put("studentName", "Unknown Student");
                    data.put("studentEmail", "n/a");
                }
                
                return data;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(students);
        } catch (Exception e) {
            log.error("CRITICAL ERROR in getInstructorStudents: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}