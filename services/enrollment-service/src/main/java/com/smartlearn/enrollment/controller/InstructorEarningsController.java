package com.smartlearn.enrollment.controller;

import com.smartlearn.enrollment.client.CourseClient;
import com.smartlearn.enrollment.domain.Enrollment;
import com.smartlearn.enrollment.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments/instructor")
@RequiredArgsConstructor
@Slf4j
public class InstructorEarningsController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseClient courseClient;

    @GetMapping("/{instructorId}/history")
    public ResponseEntity<Map<String, Object>> getEarningsHistory(@PathVariable UUID instructorId) {
        log.info("Request: Earnings history for instructor {}", instructorId);
        
        try {
            List<String> courseIds = courseClient.getInstructorCourseIds(instructorId.toString());
            if (courseIds == null || courseIds.isEmpty()) {
                return ResponseEntity.ok(createEmptyResponse());
            }

            List<UUID> courseUUIDs = courseIds.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            List<Enrollment> enrollments = enrollmentRepository.findAllByCourseIdIn(courseUUIDs);
            enrollments.sort((e1, e2) -> {
                if (e1.getEnrolledAt() == null) return 1;
                if (e2.getEnrolledAt() == null) return -1;
                return e2.getEnrolledAt().compareTo(e1.getEnrolledAt());
            });

            // Cache course titles (only title needed now — price comes from paid_price)
            Map<UUID, String> courseTitleCache = new HashMap<>();

            BigDecimal totalBalance = BigDecimal.ZERO;
            BigDecimal thisMonthRevenue = BigDecimal.ZERO;
            long newEnrollmentsCount = 0;

            LocalDateTime startOfMonth = LocalDateTime.now()
                    .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

            List<Map<String, Object>> transactions = new ArrayList<>();

            for (Enrollment enrollment : enrollments) {
                // Use the price stored AT PURCHASE TIME — never changes
                BigDecimal price = BigDecimal.valueOf(enrollment.getPaidPrice());

                // Fetch course title (cached)
                String courseTitle = courseTitleCache.computeIfAbsent(enrollment.getCourseId(), cid -> {
                    try {
                        Map<String, Object> course = courseClient.getCourseById(cid.toString());
                        return course != null ? (String) course.get("title") : "Bilinmeyen Kurs";
                    } catch (Exception ex) {
                        return "Bilinmeyen Kurs";
                    }
                });

                Map<String, Object> tx = new HashMap<>();
                tx.put("id", enrollment.getId().toString());
                tx.put("course", courseTitle);
                tx.put("amount", price.doubleValue());
                tx.put("date", enrollment.getEnrolledAt() != null
                        ? enrollment.getEnrolledAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                        : "n/a");
                tx.put("status", "Tamamlandı");
                transactions.add(tx);

                totalBalance = totalBalance.add(price);

                boolean isThisMonth = enrollment.getEnrolledAt() != null
                        && !enrollment.getEnrolledAt().isBefore(startOfMonth);

                if (isThisMonth) {
                    thisMonthRevenue = thisMonthRevenue.add(price);
                    newEnrollmentsCount++;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalBalance", totalBalance.doubleValue());
            response.put("availableWithdrawal", totalBalance.multiply(new BigDecimal("0.85")).doubleValue());
            response.put("thisMonthRevenue", thisMonthRevenue.doubleValue());
            response.put("newEnrollmentsCount", newEnrollmentsCount);
            response.put("transactions", transactions);

            log.info("Earnings - Total: {}, Monthly: {}, Count: {}", totalBalance, thisMonthRevenue, newEnrollmentsCount);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Earnings API Error", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Map<String, Object> createEmptyResponse() {
        Map<String, Object> res = new HashMap<>();
        res.put("totalBalance", 0.0);
        res.put("availableWithdrawal", 0.0);
        res.put("thisMonthRevenue", 0.0);
        res.put("newEnrollmentsCount", 0L);
        res.put("transactions", List.of());
        return res;
    }
}
