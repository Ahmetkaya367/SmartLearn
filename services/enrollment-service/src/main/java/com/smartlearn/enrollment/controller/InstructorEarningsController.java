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
            // 1. Kurs Listesi
            List<String> courseIds = courseClient.getInstructorCourseIds(instructorId.toString());
            if (courseIds == null || courseIds.isEmpty()) {
                return ResponseEntity.ok(createEmptyResponse());
            }

            List<UUID> courseUUIDs = courseIds.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            // 2. Kayıtları çek
            List<Enrollment> enrollments = enrollmentRepository.findAllByCourseIdIn(courseUUIDs);
            enrollments.sort((e1, e2) -> e2.getEnrolledAt().compareTo(e1.getEnrolledAt()));

            // 3. Hesaplama Parametreleri
            Map<UUID, Map<String, Object>> courseCache = new HashMap<>();
            BigDecimal totalBalance = BigDecimal.ZERO;
            BigDecimal thisMonthRevenue = BigDecimal.ZERO;
            long newEnrollmentsCount = 0;
            
            // Hassas Eşik: 31 gün öncesi
            LocalDateTime threshold = LocalDateTime.now().minusDays(31).withHour(0).withMinute(0);
            log.info("System Time: {}, Threshold: {}", LocalDateTime.now(), threshold);

            List<Map<String, Object>> transactions = new ArrayList<>();
            for (Enrollment enrollment : enrollments) {
                Map<String, Object> tx = new HashMap<>();
                tx.put("id", enrollment.getId().toString());
                tx.put("date", enrollment.getEnrolledAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                tx.put("status", "Tamamlandı");

                // Kurs Detayı (Fiyat ve Başlık)
                Map<String, Object> course = courseCache.computeIfAbsent(enrollment.getCourseId(), 
                    id -> courseClient.getCourseById(id.toString()));
                
                BigDecimal price = BigDecimal.ZERO;
                if (course != null) {
                    tx.put("course", course.get("title"));
                    Object p = course.get("price");
                    if (p != null) {
                        try {
                            price = new BigDecimal(p.toString());
                        } catch (Exception ex) {
                            log.error("Price parse error: {}", p);
                        }
                    }
                } else {
                    tx.put("course", "Unknown (" + enrollment.getCourseId() + ")");
                }
                
                tx.put("amount", price.doubleValue());
                transactions.add(tx);

                // Toplam Bakiye
                totalBalance = totalBalance.add(price);

                // Aylık Kontrol: Eğer tarih eşikten sonraysa VEYA yıl/ay bugünle aynıysa dahil et
                boolean isThisMonth = enrollment.getEnrolledAt().isAfter(threshold) || 
                                     (enrollment.getEnrolledAt().getYear() == LocalDateTime.now().getYear() && 
                                      enrollment.getEnrolledAt().getMonth() == LocalDateTime.now().getMonth());

                if (isThisMonth) {
                    thisMonthRevenue = thisMonthRevenue.add(price);
                    newEnrollmentsCount++;
                    log.info("MATCH: {} added to monthly. Date: {}", price, enrollment.getEnrolledAt());
                } else {
                    log.info("NO MATCH: {} not in monthly. Date: {}", price, enrollment.getEnrolledAt());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalBalance", totalBalance.doubleValue());
            response.put("availableWithdrawal", totalBalance.multiply(new BigDecimal("0.7")).doubleValue());
            response.put("thisMonthRevenue", thisMonthRevenue.doubleValue());
            response.put("newEnrollmentsCount", newEnrollmentsCount);
            response.put("transactions", transactions);
            
            // Debugging
            response.put("_sys_time", LocalDateTime.now().toString());
            response.put("_threshold", threshold.toString());

            log.info("Response Stats - Total: {}, Monthly: {}, Count: {}", totalBalance, thisMonthRevenue, newEnrollmentsCount);

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
