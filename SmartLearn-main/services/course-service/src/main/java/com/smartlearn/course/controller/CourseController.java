package com.smartlearn.course.controller;

import com.smartlearn.course.domain.CourseStatus;
import com.smartlearn.course.dto.CourseResponse;
import com.smartlearn.course.dto.CreateCourseRequest;
import com.smartlearn.course.repository.CourseRepository;
import com.smartlearn.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Slf4j
public class CourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/all")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.publishCourse(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CourseResponse> rejectCourse(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.rejectCourse(id));
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@RequestBody CreateCourseRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Creating course for X-User-Id: {}", userId);
        try {
            UUID instructorId = UUID.fromString(userId);
            return ResponseEntity.ok(courseService.createCourse(request, instructorId));
        } catch (Exception e) {
            log.error("Failed to create course for user [{}]: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable UUID id,
            @RequestBody com.smartlearn.course.dto.UpdateCourseRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Updating course {} for X-User-Id: {}", id, userId);
        try {
            UUID instructorId = UUID.fromString(userId);
            return ResponseEntity.ok(courseService.updateCourse(id, request, instructorId));
        } catch (Exception e) {
            log.error("Failed to update course {} for user [{}]: {}", id, userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<CourseResponse>> getInstructorCourses(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("Fetching instructor courses for X-User-Id: {}", userId);

        if (userId == null || userId.isEmpty()) {
            log.error("Missing X-User-Id header");
            return ResponseEntity.badRequest().build();
        }

        try {
            UUID instructorId = UUID.fromString(userId);
            return ResponseEntity.ok(courseService.getInstructorCourses(instructorId));
        } catch (Exception e) {
            log.error("Failed to fetch instructor courses for user [{}]: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCourseStats() {
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.findAll().stream()
                .filter(course -> course.getStatus() == CourseStatus.PUBLISHED)
                .count();
        long draftCourses = courseRepository.findAll().stream()
                .filter(course -> course.getStatus() == CourseStatus.DRAFT)
                .count();
        long pendingCourses = courseRepository.findAll().stream()
                .filter(course -> course.getStatus() == CourseStatus.PENDING_APPROVAL)
                .count();

        return ResponseEntity.ok(Map.of(
                "totalCourses", totalCourses,
                "publishedCourses", publishedCourses,
                "draftCourses", draftCourses,
                "pendingCourses", pendingCourses));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingCourses() {
        List<Map<String, Object>> pending = courseRepository.findAll().stream()
                .filter(course -> course.getStatus() == CourseStatus.PENDING_APPROVAL)
                .map(course -> Map.<String, Object>of(
                        "id", course.getId().toString(),
                        "title", course.getTitle(),
                        "instructorId", course.getInstructorId().toString(),
                        "status", course.getStatus().name()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCourses() {
        return ResponseEntity.ok(courseRepository.count());
    }

    @GetMapping("/instructor/{instructorId}/count")
    public ResponseEntity<Long> getInstructorCourseCount(@PathVariable UUID instructorId) {
        return ResponseEntity.ok((long) courseRepository.findAllByInstructorId(instructorId).size());
    }

    @GetMapping("/instructor/{instructorId}/ids")
    public ResponseEntity<List<String>> getInstructorCourseIds(@PathVariable UUID instructorId) {
        return ResponseEntity.ok(courseRepository.findAllByInstructorId(instructorId).stream()
                .map(course -> course.getId().toString())
                .collect(Collectors.toList()));
    }

    // Header propagation check
    @GetMapping("/me")
    public ResponseEntity<String> getMyInfo(@RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        return ResponseEntity.ok("User ID: " + userId + ", Role: " + role);
    }
}
