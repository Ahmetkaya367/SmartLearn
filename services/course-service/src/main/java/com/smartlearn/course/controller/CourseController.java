package com.smartlearn.course.controller;

import com.smartlearn.course.domain.Category;
import com.smartlearn.course.domain.CourseStatus;
import com.smartlearn.course.dto.CourseResponse;
import com.smartlearn.course.dto.CreateCourseRequest;
import com.smartlearn.course.repository.CategoryRepository;
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
    private final CategoryRepository categoryRepository;

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
    public ResponseEntity<?> publishCourse(@PathVariable UUID id) {
        log.info("Approve request received for course ID: {}", id);
        try {
            return ResponseEntity.ok(courseService.publishCourse(id));
        } catch (Exception e) {
            log.error("CRITICAL ERROR while publishing course {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Course approval failed: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectCourse(@PathVariable UUID id) {
        log.info("Reject request received for course ID: {}", id);
        try {
            return ResponseEntity.ok(courseService.rejectCourse(id));
        } catch (Exception e) {
            log.error("CRITICAL ERROR while rejecting course {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Course rejection failed: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CreateCourseRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Creating course for X-User-Id: {}", userId);
        try {
            UUID instructorId = UUID.fromString(userId);
            return ResponseEntity.ok(courseService.createCourse(request, instructorId));
        } catch (Exception e) {
            log.error("Failed to create course for user [{}]: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "None"));
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
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Deleting course {} for X-User-Id: {}", id, userId);
        try {
            UUID instructorId = UUID.fromString(userId);
            courseService.deleteCourse(id, instructorId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete course {} for user [{}]: {}", id, userId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByInstructorId(@PathVariable UUID instructorId) {
        log.info("Fetching courses for instructor ID: {}", instructorId);
        return ResponseEntity.ok(courseService.getInstructorCourses(instructorId));
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

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            log.info("Fetching categories from persistent storage");
            List<String> categories = categoryRepository.findAll().stream()
                    .map(Category::getName)
                    .collect(Collectors.toList());
            
            // Eğer tablo tamamen boşsa (ilk kurulum), varsayılanları döndür
            if (categories.isEmpty()) {
                return ResponseEntity.ok(List.of(
                    "Yazılım", "Veri Bilimi", "Pazarlama", "Tasarım", 
                    "Finans", "Fotoğrafçılık", "İşletme", "Bilişim ve Güvenlik"
                ));
            }
            
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error in getCategories: ", e);
            return ResponseEntity.status(500).body("Error fetching categories: " + e.getMessage());
        }
    }

    @PostMapping("/categories")
    public ResponseEntity<?> addCategory(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category name is required");
            }
            courseService.addCategory(name);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/categories/rename")
    public ResponseEntity<?> renameCategory(@RequestBody Map<String, String> request) {
        try {
            String oldName = request.get("oldName");
            String newName = request.get("newName");
            
            if (oldName == null || newName == null) {
                return ResponseEntity.badRequest().body("oldName and newName are required");
            }

            courseService.renameCategory(oldName, newName);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error in renameCategory: ", e);
            return ResponseEntity.status(500).body("Error renaming category: " + e.getMessage());
        }
    }

    @DeleteMapping("/categories/{name}")
    public ResponseEntity<?> deleteCategory(@PathVariable String name) {
        try {
            courseService.deleteCategory(name);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/increment-student-count")
    public ResponseEntity<?> incrementStudentCount(@PathVariable UUID id) {
        try {
            courseService.incrementStudentCount(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
