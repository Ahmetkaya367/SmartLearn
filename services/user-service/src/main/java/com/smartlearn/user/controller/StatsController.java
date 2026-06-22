package com.smartlearn.user.controller;

import com.smartlearn.user.client.CourseClient;
import com.smartlearn.user.client.EnrollmentClient;
import com.smartlearn.user.domain.UserProfile;
import com.smartlearn.user.dto.AdminStatsResponse;
import com.smartlearn.user.dto.InstructorStatsResponse;
import com.smartlearn.user.dto.StudentStatsResponse;
import com.smartlearn.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users/stats")
@RequiredArgsConstructor
public class StatsController {

    private final CourseClient courseClient;
    private final EnrollmentClient enrollmentClient;
    private final UserProfileRepository userProfileRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        log.info("Fetching admin stats from database");
        try {
            // Kullanıcı bilgisi authdb -> user_profile tablosundan
            long totalUsers = userProfileRepository.count();
            log.info("Total users from database: {}", totalUsers);

            // Kurs sayısı course-service'den
            Long totalCourses = courseClient.getTotalCourses();
            if (totalCourses == null) {
                log.warn("Course service unavailable, using fallback 0 for totalCourses");
                totalCourses = 0L;
            }
            log.info("Total courses from course-service: {}", totalCourses);

            // Enrollment verilerinden distinct kullanıcı sayısı
            Long distinctUsers = enrollmentClient.getDistinctUserCount();
            if (distinctUsers == null) {
                log.warn("Enrollment service unavailable, using totalUsers as distinctUsers");
                distinctUsers = totalUsers;
            }
            log.info("Distinct enrolled users from enrollment-service: {}", distinctUsers);

            // Gerçek gelir: Her kayıt anındaki paid_price toplamı (enrollmentdb)
            Double totalRevenue = enrollmentClient.getTotalRevenue();
            if (totalRevenue == null) {
                log.warn("Enrollment service unavailable for total revenue, using 0");
                totalRevenue = 0.0;
            }
            log.info("Real total revenue from paid_price sum: {}", totalRevenue);

            // Cevap için en son 5 kullanıcı
            List<AdminStatsResponse.RecentUser> recentUsers = userProfileRepository.findAll().stream()
                    .sorted(Comparator.comparing(UserProfile::getCreatedAt).reversed())
                    .limit(5)
                    .map(user -> AdminStatsResponse.RecentUser.builder()
                            .id(user.getId().toString())
                            .name(user.getFullName() != null ? user.getFullName() : "Unknown")
                            .email(user.getEmail() != null ? user.getEmail() : "unknown@example.com")
                            .joinedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString()
                                    : LocalDateTime.now().toString())
                            .build())
                    .toList();
            log.info("Recent users count: {}", recentUsers.size());

            // Beklemede olan kurslar
            List<Map<String, Object>> pendingCourses = courseClient.getPendingCourses();
            if (pendingCourses == null) {
                log.warn("Course service unavailable for pending courses, using empty list");
                pendingCourses = List.of();
            }
            List<AdminStatsResponse.PendingApproval> pendingApprovals = pendingCourses.stream()
                    .map(course -> AdminStatsResponse.PendingApproval.builder()
                            .id((String) course.get("id"))
                            .title((String) course.getOrDefault("title", "Unknown Title"))
                            .instructor((String) course.getOrDefault("instructorId", "Unknown Instructor"))
                            .submittedAt(LocalDateTime.now().toString())
                            .build())
                    .toList();
            log.info("Pending approvals count: {}", pendingApprovals.size());

            // Büyüme oranı placeholder
            double growthRate = 10.0;

            return ResponseEntity.ok(AdminStatsResponse.builder()
                    .totalUsers(totalUsers)
                    .totalCourses(totalCourses)
                    .totalRevenue(totalRevenue)
                    .growthRate(growthRate)
                    .recentUsers(recentUsers)
                    .pendingApprovals(pendingApprovals)
                    .build());
        } catch (Exception e) {
            log.error("getAdminStats API Error: ", e);
            // Fallback: Sistem patlamasın, varsayılan değerlerle dön
            return ResponseEntity.ok(AdminStatsResponse.builder()
                    .totalUsers(0L)
                    .totalCourses(0L)
                    .totalRevenue(0.0)
                    .growthRate(0.0)
                    .recentUsers(List.of())
                    .pendingApprovals(List.of())
                    .build());
        }
    }

    @GetMapping("/instructor")
    public ResponseEntity<InstructorStatsResponse> getInstructorStats(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("Fetching instructor stats for userId: {}", userId);
        try {
            UUID instructorUUID = resolveUserId(userId, "22222222-2222-2222-2222-222222222222");
            String instructorIdStr = instructorUUID.toString();

            // Eğitmenin kurs sayısı
            Long totalCourses = courseClient.getInstructorCourseCount(instructorIdStr);
            if (totalCourses == null) {
                log.warn("Course service unavailable for instructor course count, using 0");
                totalCourses = 0L;
            }
            log.info("Instructor total courses: {}", totalCourses);

            // Eğitmen kurslarının toplam öğrencisi
            Map<String, Object> instructorEnrollmentStats = enrollmentClient
                    .getInstructorEnrollmentStats(instructorIdStr);
            Long totalStudents = 0L;
            Double totalRevenue = 0.0;
            if (instructorEnrollmentStats != null) {
                if (instructorEnrollmentStats.get("totalStudents") != null) {
                    totalStudents = ((Number) instructorEnrollmentStats.get("totalStudents")).longValue();
                }
                if (instructorEnrollmentStats.get("estimatedRevenue") != null) {
                    totalRevenue = ((Number) instructorEnrollmentStats.get("estimatedRevenue")).doubleValue();
                }
            } else {
                log.warn("Enrollment service unavailable for instructor stats, using 0");
            }
            log.info("Instructor total students: {}, total revenue: {}", totalStudents, totalRevenue);

            Double thisMonthRevenue = totalRevenue * 0.2; // placeholder

            List<String> myCourses = courseClient.getInstructorCourseIds(instructorIdStr);
            if (myCourses == null) {
                log.warn("Course service unavailable for instructor course ids, using empty list");
                myCourses = List.of();
            }
            log.info("Instructor course ids count: {}", myCourses.size());

            return ResponseEntity.ok(InstructorStatsResponse.builder()
                    .totalCourses(totalCourses)
                    .totalStudents(totalStudents)
                    .totalRevenue(totalRevenue)
                    .thisMonthRevenue(thisMonthRevenue)
                    .myCourses(myCourses)
                    .build());
        } catch (Exception e) {
            log.error("getInstructorStats API Error: ", e);
            // Fallback: Sistem patlamasın, varsayılan değerlerle dön
            return ResponseEntity.ok(InstructorStatsResponse.builder()
                    .totalCourses(0L)
                    .totalStudents(0L)
                    .totalRevenue(0.0)
                    .thisMonthRevenue(0.0)
                    .myCourses(List.of())
                    .build());
        }
    }

    @GetMapping("/student")
    public ResponseEntity<StudentStatsResponse> getStudentStats(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("Fetching student stats for userId: {}", userId);
        try {
            UUID studentId = resolveUserId(userId, "33333333-3333-3333-3333-333333333333");

            // Öğrencinin kayıtlı kursları (enrollment-service'ten)
            List<Map<String, Object>> userProgress = enrollmentClient.getUserProgress(studentId);
            if (userProgress == null) {
                log.warn("Enrollment service unavailable for user progress, using empty list");
                userProgress = List.of();
            }
            log.info("User progress entries: {}", userProgress.size());

            // Kayıtlı kurs listesi
            List<String> enrolledCourses = userProgress.stream()
                    .map(p -> (String) p.get("courseId"))
                    .filter(courseId -> courseId != null)
                    .toList();

            // İlerleme durumu
            List<StudentStatsResponse.InProgressCourse> inProgress = userProgress.stream()
                    .map(p -> StudentStatsResponse.InProgressCourse.builder()
                            .enrollmentId((String) p.get("enrollmentId"))
                            .courseId((String) p.get("courseId"))
                            .progress(((Number) p.getOrDefault("progress", 0)).intValue())
                            .lastAccessed((String) p.getOrDefault("lastAccessed", LocalDateTime.now().toString()))
                            .build())
                    .toList();

            // Belge sayısı
            int certificates = 0;
            try {
                Long certCount = enrollmentClient.getCertificateCount(studentId);
                if (certCount != null) {
                    certificates = certCount.intValue();
                }
            } catch (Exception e) {
                log.warn("Failed to fetch certificate count: {}", e.getMessage());
            }

            // Öğrenme süresi (gerçek veritabanı saniyelerinden)
            String learningTime = "0dk";
            try {
                Integer totalSeconds = enrollmentClient.getLearningTime(studentId);
                if (totalSeconds != null && totalSeconds > 0) {
                    // Toplam dakikayı hesapla (saniyeyi 60'a böl)
                    int totalMinutes = totalSeconds / 60;
                    if (totalMinutes == 0 && totalSeconds > 0) totalMinutes = 1; // 1 dk'dan azsa 1 dk göster
                    learningTime = totalMinutes + " dk";
                }
            } catch (Exception e) {
                log.warn("Failed to fetch learning time: {}", e.getMessage());
            }

            log.info("Student enrolled courses: {}, certificates: {}, learning time: {}", enrolledCourses.size(),
                    certificates, learningTime);

            return ResponseEntity.ok(StudentStatsResponse.builder()
                    .enrolledCourses(enrolledCourses)
                    .inProgress(inProgress)
                    .certificates(certificates)
                    .learningTime(learningTime)
                    .build());
        } catch (Exception e) {
            log.error("Enrollment servisine ulaşılamadı: ", e);
            // Fallback: Sistem patlamasın, varsayılan değerlerle dön
            return ResponseEntity.ok(StudentStatsResponse.builder()
                    .enrolledCourses(List.of())
                    .inProgress(List.of())
                    .certificates(0)
                    .learningTime("0h")
                    .build());
        }
    }

    private UUID resolveUserId(String userIdStr, String defaultId) {
        final String finalUserId = (userIdStr == null || userIdStr.isEmpty()) ? defaultId : userIdStr;

        try {
            // Eğer UUID ise direkt dön
            return UUID.fromString(finalUserId);
        } catch (IllegalArgumentException e) {
            // UUID değilse e-posta olarak kabul et ve veritabanından ara
            log.info("userId is not a UUID, searching by email: {}", finalUserId);
            return userProfileRepository.findByEmail(finalUserId)
                    .map(UserProfile::getId)
                    .orElseGet(() -> {
                        log.warn("User not found by email: {}, using default ID", finalUserId);
                        return UUID.fromString(defaultId);
                    });
        }
    }
}
