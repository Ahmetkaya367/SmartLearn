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

    @GetMapping("/total-revenue")
    public ResponseEntity<Double> getTotalRevenue() {
        return ResponseEntity.ok(enrollmentRepository.sumTotalRevenue());
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
        com.smartlearn.enrollment.repository.CertificateRepository certificateRepo = 
                org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(
                    ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
                ).getBean(com.smartlearn.enrollment.repository.CertificateRepository.class);

        return ResponseEntity.ok((long) certificateRepo.findByUserId(userId).size());
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

        // Use stored paid_price from enrollments instead of current course price
        double estimatedRevenue = courseIds.stream()
                .map(UUID::fromString)
                .flatMap(cid -> enrollmentRepository.findAllByCourseIdIn(List.of(cid)).stream())
                .mapToDouble(Enrollment::getPaidPrice)
                .sum();

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
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "courseIds list is required and cannot be empty"));
            }

            List<Enrollment> newEnrollments = new ArrayList<>();
            for (String cIdStr : courseIdsStr) {
                UUID courseId = UUID.fromString(cIdStr);

                // Check if already enrolled (optional but recommended to prevent duplicates)
                List<Enrollment> existing = enrollmentRepository.findByUserId(userId).stream()
                        .filter(e -> e.getCourseId().equals(courseId))
                        .collect(Collectors.toList());

                if (existing.isEmpty()) {
                    // Fetch current price snapshot at enrollment time
                    double priceAtPurchase = 0.0;
                    try {
                        Map<String, Object> courseData = courseClient.getCourseById(cIdStr);
                        if (courseData != null && courseData.get("price") != null) {
                            priceAtPurchase = ((Number) courseData.get("price")).doubleValue();
                        }
                    } catch (Exception ex) {
                        log.warn("Could not fetch price for course {}: {}", cIdStr, ex.getMessage());
                    }
                    Enrollment enrollment = Enrollment.builder()
                            .userId(userId)
                            .courseId(courseId)
                            .progressPercent(0)
                            .paidPrice(priceAtPurchase)
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
                        log.warn("Failed to increment student count for course {}: {}", e.getCourseId(),
                                ex.getMessage());
                    }
                }
            } else {
                log.info("User {} was already enrolled in requested courses.", userId);
            }

            return ResponseEntity
                    .ok(Map.of("message", "Enrollment successful", "enrolledCount", newEnrollments.size()));
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

            Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow(() -> new RuntimeException("Enrollment not found"));
            Map<String, Object> course = courseClient.getCourseById(enrollment.getCourseId().toString());
            
            int currentLessonVersion = 1;
            int totalLessons = 0;
            if (course != null && course.containsKey("sections")) {
                List<Map<String, Object>> sections = (List<Map<String, Object>>) course.get("sections");
                if (sections != null) {
                    for (Map<String, Object> section : sections) {
                        if (section.containsKey("lessons")) {
                            List<Map<String, Object>> lessons = (List<Map<String, Object>>) section.get("lessons");
                            if (lessons != null) {
                                totalLessons += lessons.size();
                                for (Map<String, Object> lesson : lessons) {
                                    if (lessonId.toString().equals(lesson.get("id").toString())) {
                                        currentLessonVersion = lesson.containsKey("version") ? (int) lesson.get("version") : 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            com.smartlearn.enrollment.domain.LessonProgress lessonProgress = lessonProgressRepository
                    .findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
                    .orElse(new com.smartlearn.enrollment.domain.LessonProgress());

            if (lessonProgress.getEnrollmentId() == null) {
                lessonProgress.setEnrollmentId(enrollmentId);
                lessonProgress.setLessonId(lessonId);
                lessonProgress.setLessonVersion(currentLessonVersion);
            }

            if (lessonProgress.getLessonVersion() != currentLessonVersion) {
                lessonProgress.setLessonVersion(currentLessonVersion);
                lessonProgress.setWatchedSeconds(0);
                lessonProgress.setCompleted(false);
                watchedSeconds = 0;
                isCompleted = false;
            } else {
                if (watchedSeconds > lessonProgress.getWatchedSeconds()) {
                    lessonProgress.setWatchedSeconds(watchedSeconds);
                }
                if (isCompleted) {
                    lessonProgress.setCompleted(true);
                }
            }

            lessonProgress.setLastUpdatedAt(java.time.LocalDateTime.now());
            lessonProgressRepository.save(lessonProgress);

            List<com.smartlearn.enrollment.domain.LessonProgress> allProgress = lessonProgressRepository
                    .findByEnrollmentId(enrollmentId);
                    
            long completedLessonsCount = 0;
            if (course != null && course.containsKey("sections")) {
                List<Map<String, Object>> sections = (List<Map<String, Object>>) course.get("sections");
                if (sections != null) {
                    for (Map<String, Object> section : sections) {
                        if (section.containsKey("lessons")) {
                            List<Map<String, Object>> lessons = (List<Map<String, Object>>) section.get("lessons");
                            if (lessons != null) {
                                for (Map<String, Object> lesson : lessons) {
                                    String id = lesson.get("id").toString();
                                    int lVersion = lesson.containsKey("version") ? (int) lesson.get("version") : 1;
                                    
                                    boolean isMatchCompleted = allProgress.stream()
                                            .anyMatch(p -> p.getLessonId().toString().equals(id) 
                                                        && p.isCompleted() 
                                                        && p.getLessonVersion() == lVersion);
                                    if (isMatchCompleted) {
                                        completedLessonsCount++;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (totalLessons > 0) {
                int percent = (int) ((completedLessonsCount * 100.0) / totalLessons);
                percent = Math.min(100, percent);
                
                enrollment.setProgressPercent(percent);
                enrollmentRepository.save(enrollment);
                return ResponseEntity.ok(Map.of("progressPercent", percent));
            }

            return ResponseEntity.ok(Map.of("progressPercent", enrollment.getProgressPercent()));
        } catch (Exception e) {
            log.error("Failed to update progress: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update progress: " + e.getMessage());
        }
    }

    @GetMapping("/progress/{enrollmentId}/{lessonId}")
    public ResponseEntity<?> getLessonProgress(@PathVariable UUID enrollmentId, @PathVariable UUID lessonId) {
        log.info("Fetching progress for enrollment {} and lesson {}", enrollmentId, lessonId);
        Optional<com.smartlearn.enrollment.domain.LessonProgress> progressOpt = lessonProgressRepository
                .findByEnrollmentIdAndLessonId(enrollmentId, lessonId);
                
        if (progressOpt.isPresent()) {
            com.smartlearn.enrollment.domain.LessonProgress progress = progressOpt.get();
            try {
                Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
                if (enrollment != null) {
                    Map<String, Object> course = courseClient.getCourseById(enrollment.getCourseId().toString());
                    int currentLessonVersion = 1;
                    if (course != null && course.containsKey("sections")) {
                        List<Map<String, Object>> sections = (List<Map<String, Object>>) course.get("sections");
                        if (sections != null) {
                            for (Map<String, Object> section : sections) {
                                if (section.containsKey("lessons")) {
                                    List<Map<String, Object>> lessons = (List<Map<String, Object>>) section.get("lessons");
                                    if (lessons != null) {
                                        for (Map<String, Object> lesson : lessons) {
                                            if (lessonId.toString().equals(lesson.get("id").toString())) {
                                                currentLessonVersion = lesson.containsKey("version") ? (int) lesson.get("version") : 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if (progress.getLessonVersion() != currentLessonVersion) {
                        progress.setLessonVersion(currentLessonVersion);
                        progress.setWatchedSeconds(0);
                        progress.setCompleted(false);
                        lessonProgressRepository.save(progress);
                    }
                }
            } catch(Exception e) {
                log.warn("Error checking lesson version: {}", e.getMessage());
            }

            log.info("Found progress: {} seconds", progress.getWatchedSeconds());
            return ResponseEntity.ok(progress);
        }
        log.info("No progress found for enrollment {} and lesson {}, returning 0", enrollmentId, lessonId);
        return ResponseEntity.ok(Map.of("watchedSeconds", 0));
    }

    @DeleteMapping("/lesson/{lessonId}/progress")
    public ResponseEntity<?> resetLessonProgress(@PathVariable UUID lessonId) {
        log.info("Resetting progress for lesson {}", lessonId);
        try {
            lessonProgressRepository.deleteByLessonId(lessonId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to reset lesson progress for lesson {}: {}", lessonId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/progress/{enrollmentId}/last")
    public ResponseEntity<?> getLastWatchedLesson(@PathVariable UUID enrollmentId) {
        Optional<com.smartlearn.enrollment.domain.LessonProgress> progress = lessonProgressRepository
                .findLastWatchedLesson(enrollmentId);
        if (progress.isPresent()) {
            return ResponseEntity.ok(progress.get());
        }
        return ResponseEntity.ok(Map.of("watchedSeconds", 0));
    }

    @GetMapping("/{enrollmentId}/progress")
    public ResponseEntity<List<com.smartlearn.enrollment.domain.LessonProgress>> getEnrollmentProgress(
            @PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(lessonProgressRepository.findByEnrollmentId(enrollmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEnrollmentById(@PathVariable UUID id) {
        return enrollmentRepository.findById(id)
                .map(enrollment -> {
                    com.smartlearn.enrollment.repository.CertificateRepository certRepo = 
                            org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(
                                ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
                            ).getBean(com.smartlearn.enrollment.repository.CertificateRepository.class);
                            
                    com.smartlearn.enrollment.domain.Certificate cert = certRepo.findByEnrollmentId(id).orElse(null);
                    
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("id", enrollment.getId());
                    response.put("userId", enrollment.getUserId());
                    response.put("courseId", enrollment.getCourseId());
                    response.put("progressPercent", enrollment.getProgressPercent());
                    response.put("enrolledAt", enrollment.getEnrolledAt());
                    response.put("lastAccessedAt", enrollment.getLastAccessedAt());
                    
                    if (cert != null) {
                        response.put("certificateUrl", cert.getCertificateUrl());
                        response.put("certificateCode", cert.getCertificateCode());
                    }
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/certificate")
    public ResponseEntity<?> uploadCertificate(@PathVariable UUID id, @RequestParam("file") MultipartFile file,
                                                @RequestParam(value = "certificateCode", required = false) String certificateCode) {
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
            
            // Check if certificate already exists
            com.smartlearn.enrollment.repository.CertificateRepository certificateRepo = 
                org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(
                    ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
                ).getBean(com.smartlearn.enrollment.repository.CertificateRepository.class);

            com.smartlearn.enrollment.domain.Certificate certificate = certificateRepo.findByEnrollmentId(id)
                .orElse(new com.smartlearn.enrollment.domain.Certificate());

            certificate.setEnrollmentId(id);
            certificate.setUserId(enrollment.getUserId());
            certificate.setCourseId(enrollment.getCourseId());
            certificate.setCertificateUrl(certificateUrl);
            certificate.setIssuedAt(LocalDateTime.now());

            if (certificateCode != null && !certificateCode.isEmpty()) {
                certificate.setCertificateCode(certificateCode);
            } else if (certificate.getCertificateCode() == null) {
                certificate.setCertificateCode("LRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }

            // Fetch info to save in certificate for snapshot
            try {
                Map<String, Object> userProfile = userClient.getUserProfile(enrollment.getUserId());
                certificate.setStudentName(userProfile != null ? (String) userProfile.get("fullName") : "Bilinmeyen Öğrenci");
            } catch (Exception e) {
                certificate.setStudentName("Bilinmeyen Öğrenci");
            }

            try {
                Map<String, Object> course = courseClient.getCourseById(enrollment.getCourseId().toString());
                certificate.setCourseTitle(course != null ? (String) course.get("title") : "Bilinmeyen Kurs");
                certificate.setInstructorName(course != null ? (String) course.get("instructor") : "Bilinmeyen Eğitmen");
            } catch (Exception e) {
                certificate.setCourseTitle("Bilinmeyen Kurs");
                certificate.setInstructorName("Bilinmeyen Eğitmen");
            }

            certificateRepo.save(certificate);

            return ResponseEntity.ok(Map.of("url", certificateUrl, "certificateCode", certificate.getCertificateCode()));
        } catch (Exception e) {
            log.error("Failed to upload certificate: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to upload certificate: " + e.getMessage());
        }
    }

    @GetMapping("/certificates/me")
    public ResponseEntity<List<Map<String, Object>>> getMyCertificates(@RequestHeader("X-User-Id") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        
        com.smartlearn.enrollment.repository.CertificateRepository certificateRepo = 
                org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(
                    ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
                ).getBean(com.smartlearn.enrollment.repository.CertificateRepository.class);

        List<com.smartlearn.enrollment.domain.Certificate> certificates = certificateRepo.findByUserId(userId);

        List<Map<String, Object>> response = certificates.stream().map(c -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", c.getId());
            data.put("certificateUrl", c.getCertificateUrl());
            data.put("certificateCode", c.getCertificateCode());
            data.put("issueDate", c.getIssuedAt() != null ? c.getIssuedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "n/a");
            data.put("courseTitle", c.getCourseTitle());
            
            // Still fetching enrollment to get progress percentage
            try {
                Enrollment e = enrollmentRepository.findById(c.getEnrollmentId()).orElse(null);
                data.put("grade", (e != null ? e.getProgressPercent() : 100) + "% Başarı");
            } catch (Exception ex) {
                data.put("grade", "100% Başarı");
            }
            return data;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/certificates/verify/{code}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String code) {
        log.info("Certificate verification request for code: {}", code);
        
        com.smartlearn.enrollment.repository.CertificateRepository certificateRepo = 
                org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(
                    ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
                ).getBean(com.smartlearn.enrollment.repository.CertificateRepository.class);

        Optional<com.smartlearn.enrollment.domain.Certificate> certOpt = certificateRepo.findByCertificateCode(code);
        
        if (certOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("valid", false, "message", "Sertifika bulunamadı."));
        }

        com.smartlearn.enrollment.domain.Certificate cert = certOpt.get();
        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("certificateCode", cert.getCertificateCode());
        result.put("issuedAt", cert.getIssuedAt() != null ? cert.getIssuedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "n/a");
        result.put("certificateUrl", cert.getCertificateUrl());
        result.put("studentName", cert.getStudentName());
        result.put("courseTitle", cert.getCourseTitle());
        result.put("instructorName", cert.getInstructorName());

        return ResponseEntity.ok(result);
    }
}