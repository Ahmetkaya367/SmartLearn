package com.smartlearn.enrollment.controller;

import com.smartlearn.enrollment.client.CourseClient;
import com.smartlearn.enrollment.client.UserClient;
import com.smartlearn.enrollment.domain.Enrollment;
import com.smartlearn.enrollment.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Slf4j
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final com.smartlearn.enrollment.repository.LessonProgressRepository lessonProgressRepository;
    private final CourseClient courseClient;
    private final UserClient userClient;

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    @Value("${app.url-prefix:http://localhost:8080/api/enrollments/uploads/}")
    private String urlPrefix;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEnrollmentStats() {
        long totalEnrollments = enrollmentRepository.countTotalEnrollments();
        long distinctUsers = enrollmentRepository.countDistinctUsers();

        return ResponseEntity.ok(Map.of(
                "totalEnrollments", totalEnrollments,
                "distinctUsers", distinctUsers));
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
                .map(enrollment -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("enrollmentId", enrollment.getId().toString());
                    entry.put("courseId", enrollment.getCourseId().toString());
                    entry.put("progress", enrollment.getProgressPercent());
                    entry.put("lastAccessed",
                            enrollment.getLastAccessedAt() != null ? enrollment.getLastAccessedAt().toString() : "");
                    return entry;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(progress);
    }

    @GetMapping("/user/{userId}/learning-time")
    public ResponseEntity<Integer> getLearningTime(@PathVariable UUID userId) {
        Integer totalSeconds = lessonProgressRepository.getTotalWatchedSecondsByUserId(userId);
        return ResponseEntity.ok(totalSeconds != null ? totalSeconds : 0);
    }

    @GetMapping("/user/{userId}/certificates/count")
    public ResponseEntity<Long> getCertificateCount(@PathVariable UUID userId) {
        return ResponseEntity.ok(enrollmentRepository.findByUserId(userId).stream()
                .filter(e -> e.getCertificateUrl() != null)
                .count());
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
                "estimatedRevenue", estimatedRevenue));
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
                log.error("API ERROR: Failed to call course-service for instructor {}: {}", instructorId,
                        e.getMessage());
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
                    log.warn("API WARN: Could not fetch profile for user {}: {}", enrollment.getUserId(),
                            e.getMessage());
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

    @GetMapping("/student/{studentId}/instructors")
    public ResponseEntity<List<String>> getStudentInstructors(@PathVariable UUID studentId) {
        log.info("Request received: Fetching instructors for student {}", studentId);
        try {
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(studentId);
            if (enrollments.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<String> instructorIds = enrollments.stream()
                    .map(enrollment -> {
                        try {
                            Map<String, Object> course = courseClient
                                    .getCourseById(enrollment.getCourseId().toString());
                            return course != null ? (String) course.get("instructorId") : null;
                        } catch (Exception e) {
                            log.warn("Could not fetch course {} for instructor lookup", enrollment.getCourseId());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(instructorIds);
        } catch (Exception e) {
            log.error("Error in getStudentInstructors: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/enroll")
    public ResponseEntity<Map<String, Object>> enrollStudent(@RequestBody Map<String, Object> request) {
        log.info("Request received: Enrolling student into courses: {}", request);
        try {
            String userIdStr = (String) request.get("userId");
            if (userIdStr == null || userIdStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
            }
            UUID userId = UUID.fromString(userIdStr);

            List<String> courseIdsStr = (List<String>) request.get("courseIds");
            if (courseIdsStr == null || courseIdsStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "courseIds list is required and cannot be empty"));
            }

            List<Enrollment> newEnrollments = new ArrayList<>();
            for (String cIdStr : courseIdsStr) {
                UUID courseId = UUID.fromString(cIdStr);

                // Check if already enrolled (optional but recommended to prevent duplicates)
                List<Enrollment> existing = enrollmentRepository.findByUserId(userId).stream()
                        .filter(e -> e.getCourseId().equals(courseId))
                        .collect(Collectors.toList());

                if (existing.isEmpty()) {
                    Enrollment enrollment = Enrollment.builder()
                            .userId(userId)
                            .courseId(courseId)
                            .progressPercent(0)
                            .enrolledAt(java.time.LocalDateTime.now())
                            .build();
                    newEnrollments.add(enrollment);
                }
            }

            if (!newEnrollments.isEmpty()) {
                enrollmentRepository.saveAll(newEnrollments);
                log.info("Successfully enrolled user {} in {} courses", userId, newEnrollments.size());
                
                // Notify course-service to increment student count
                for (Enrollment e : newEnrollments) {
                    try {
                        courseClient.incrementStudentCount(e.getCourseId().toString());
                    } catch (Exception ex) {
                        log.warn("Failed to increment student count for course {}: {}", e.getCourseId(), ex.getMessage());
                    }
                }
            } else {
                log.info("User {} was already enrolled in requested courses.", userId);
            }

            return ResponseEntity.ok(Map.of("message", "Enrollment successful", "enrolledCount", newEnrollments.size()));
        } catch (Exception e) {
            log.error("Error in enrollStudent: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to enroll: " + e.getMessage()));
        }
    }

    @PostMapping("/progress/update")
    public ResponseEntity<?> updateProgress(@RequestBody Map<String, Object> payload) {
        log.info("Received progress update request: {}", payload);
        try {
            UUID enrollmentId = UUID.fromString((String) payload.get("enrollmentId"));
            UUID lessonId = UUID.fromString((String) payload.get("lessonId"));
            int watchedSeconds = ((Number) payload.get("watchedSeconds")).intValue();
            boolean isCompleted = payload.get("isCompleted") != null && (boolean) payload.get("isCompleted");

            log.info("Processing progress for enrollment {} and lesson {}: watchedSeconds={}, isCompleted={}", 
                enrollmentId, lessonId, watchedSeconds, isCompleted);

            com.smartlearn.enrollment.domain.LessonProgress lessonProgress = lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
                    .orElse(new com.smartlearn.enrollment.domain.LessonProgress());
            
            if (lessonProgress.getEnrollmentId() == null) {
                lessonProgress.setEnrollmentId(enrollmentId);
                lessonProgress.setLessonId(lessonId);
            }

            if (watchedSeconds > lessonProgress.getWatchedSeconds()) {
                lessonProgress.setWatchedSeconds(watchedSeconds);
            }
            
            if (isCompleted) {
                lessonProgress.setCompleted(true);
            }
            
            lessonProgress.setLastUpdatedAt(java.time.LocalDateTime.now());
            lessonProgressRepository.save(lessonProgress);

                // Recalculate total course progress
                Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
                if (enrollmentOpt.isPresent()) {
                    Enrollment enrollment = enrollmentOpt.get();
                    
                    // Fetch all progress for this enrollment
                    List<com.smartlearn.enrollment.domain.LessonProgress> allProgress = lessonProgressRepository.findByEnrollmentId(enrollmentId);
                    int totalWatchedSeconds = allProgress.stream().mapToInt(com.smartlearn.enrollment.domain.LessonProgress::getWatchedSeconds).sum();

                    // Get total course duration
                    Map<String, Object> course = courseClient.getCourseById(enrollment.getCourseId().toString());
                    if (course != null && course.containsKey("duration")) {
                        Object durationObj = course.get("duration");
                        int totalCourseDuration = 0;
                        if (durationObj instanceof String str && str.contains("dk")) {
                             // The frontend gets it formatted, but we need raw seconds. 
                             // Wait, getCourseById returns the formatted one. We need the raw seconds from the DTO.
                             // Actually, let's just make getCourseById return the total duration in seconds as well.
                             // For now, let's assume getCourseById has a "durationSeconds" field or we calculate it.
                             // I'll add "totalDurationSeconds" to CourseResponse in course-service.
                        }
                        if (course.containsKey("totalDurationSeconds")) {
                            totalCourseDuration = (int) course.get("totalDurationSeconds");
                        }
                        
                        if (totalCourseDuration > 0) {
                            int percent = (int) ((totalWatchedSeconds * 100.0) / totalCourseDuration);
                            percent = Math.min(100, percent); // Cap at 100%
                            enrollment.setProgressPercent(percent);
                            enrollmentRepository.save(enrollment);
                            return ResponseEntity.ok(Map.of("progressPercent", percent));
                        }
                    }
                }
            
            // If no update occurred or course duration not found, return existing progress
            Optional<Enrollment> currentEnrollment = enrollmentRepository.findById(enrollmentId);
            return ResponseEntity.ok(Map.of("progressPercent", currentEnrollment.map(Enrollment::getProgressPercent).orElse(0)));
        } catch (Exception e) {
            log.error("Failed to update progress: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update progress: " + e.getMessage());
        }
    }

    @GetMapping("/progress/{enrollmentId}/{lessonId}")
    public ResponseEntity<?> getLessonProgress(@PathVariable UUID enrollmentId, @PathVariable UUID lessonId) {
        log.info("Fetching progress for enrollment {} and lesson {}", enrollmentId, lessonId);
        Optional<com.smartlearn.enrollment.domain.LessonProgress> progress = lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollmentId, lessonId);
        if (progress.isPresent()) {
            log.info("Found progress: {} seconds", progress.get().getWatchedSeconds());
            return ResponseEntity.ok(progress.get());
        }
        log.info("No progress found for enrollment {} and lesson {}, returning 0", enrollmentId, lessonId);
        return ResponseEntity.ok(Map.of("watchedSeconds", 0));
    }

    @GetMapping("/progress/{enrollmentId}/last")
    public ResponseEntity<?> getLastWatchedLesson(@PathVariable UUID enrollmentId) {
        Optional<com.smartlearn.enrollment.domain.LessonProgress> progress = lessonProgressRepository.findLastWatchedLesson(enrollmentId);
        if (progress.isPresent()) {
            return ResponseEntity.ok(progress.get());
        }
        return ResponseEntity.ok(Map.of("watchedSeconds", 0));
    }

    @GetMapping("/{enrollmentId}/progress")
    public ResponseEntity<List<com.smartlearn.enrollment.domain.LessonProgress>> getEnrollmentProgress(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(lessonProgressRepository.findByEnrollmentId(enrollmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable UUID id) {
        return enrollmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/certificate")
    public ResponseEntity<?> uploadCertificate(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        log.info("Request to upload certificate for enrollment {}", id);
        try {
            Enrollment enrollment = enrollmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String fileName = "cert_" + id + ".pdf";
            Path targetLocation = Paths.get(uploadDir).resolve(fileName);
            
            Files.createDirectories(targetLocation.getParent());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String certificateUrl = urlPrefix + fileName;
            enrollment.setCertificateUrl(certificateUrl);
            enrollment.setIssuedAt(LocalDateTime.now());
            enrollmentRepository.save(enrollment);

            return ResponseEntity.ok(Map.of("url", certificateUrl));
        } catch (Exception e) {
            log.error("Failed to upload certificate: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to upload certificate: " + e.getMessage());
        }
    }

    @GetMapping("/certificates/me")
    public ResponseEntity<List<Map<String, Object>>> getMyCertificates(@RequestHeader("X-User-Id") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        List<Enrollment> certificates = enrollmentRepository.findByUserId(userId).stream()
                .filter(e -> e.getCertificateUrl() != null)
                .collect(Collectors.toList());

        List<Map<String, Object>> response = certificates.stream().map(e -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", e.getId());
            data.put("certificateUrl", e.getCertificateUrl());
            data.put("issueDate", e.getIssuedAt() != null ? e.getIssuedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "n/a");
            
            try {
                Map<String, Object> course = courseClient.getCourseById(e.getCourseId().toString());
                data.put("courseTitle", course != null ? course.get("title") : "Kurs");
            } catch (Exception ex) {
                data.put("courseTitle", "Kurs (" + e.getCourseId().toString().substring(0, 8) + ")");
            }
            data.put("grade", e.getProgressPercent() + "% Başarı");
            return data;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}