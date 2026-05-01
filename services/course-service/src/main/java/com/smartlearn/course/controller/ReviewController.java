package com.smartlearn.course.controller;

import com.smartlearn.course.domain.Course;
import com.smartlearn.course.domain.Review;
import com.smartlearn.course.repository.CourseRepository;
import com.smartlearn.course.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitReview(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader,
            @RequestBody Map<String, Object> body) {
        try {
            String courseIdStr = (String) body.get("courseId");
            int rating = ((Number) body.get("rating")).intValue();
            String comment = (String) body.getOrDefault("comment", "");
            String userName = (String) body.getOrDefault("userName", userNameHeader != null ? userNameHeader : "Öğrenci");

            if (courseIdStr == null || rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "courseId and rating (1-5) are required"));
            }

            UUID courseId = UUID.fromString(courseIdStr);
            UUID userId = userIdHeader != null ? UUID.fromString(userIdHeader) : UUID.randomUUID();

            // Daha önce değerlendirildiyse güncelle, yoksa yeni kayıt ekle
            Optional<Review> existing = reviewRepository.findByUserIdAndCourseId(userId, courseId);
            Review review;
            if (existing.isPresent()) {
                review = existing.get();
                review.setRating(rating);
                review.setComment(comment);
                review.setUserName(userName);
            } else {
                review = Review.builder()
                        .courseId(courseId)
                        .userId(userId)
                        .userName(userName)
                        .rating(rating)
                        .comment(comment)
                        .build();
            }
            reviewRepository.save(review);

            // Kursu rating ve reviewCount ile güncelle
            updateCourseRating(courseId);

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Review submitted successfully");
            resp.put("reviewId", review.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("Error submitting review: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Map<String, Object>>> getCourseReviews(@PathVariable UUID courseId) {
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId().toString());
            m.put("userId", r.getUserId().toString());
            m.put("userName", r.getUserName() != null ? r.getUserName() : "Anonim");
            m.put("rating", r.getRating());
            m.put("comment", r.getComment() != null ? r.getComment() : "");
            m.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : "");
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/course/{courseId}/summary")
    public ResponseEntity<Map<String, Object>> getCourseReviewSummary(@PathVariable UUID courseId) {
        double avg = Optional.ofNullable(reviewRepository.findAverageRatingByCourseId(courseId)).orElse(0.0);
        long count = reviewRepository.countByCourseId(courseId);
        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", Math.round(avg * 10.0) / 10.0);
        summary.put("reviewCount", count);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<Map<String, Object>> getUserReviewForCourse(
            @PathVariable UUID userId, @PathVariable UUID courseId) {
        Optional<Review> review = reviewRepository.findByUserIdAndCourseId(userId, courseId);
        if (review.isEmpty()) {
            return ResponseEntity.ok(Map.of("exists", false));
        }
        Review r = review.get();
        Map<String, Object> m = new HashMap<>();
        m.put("exists", true);
        m.put("rating", r.getRating());
        m.put("comment", r.getComment() != null ? r.getComment() : "");
        return ResponseEntity.ok(m);
    }

    private void updateCourseRating(UUID courseId) {
        try {
            Double avg = reviewRepository.findAverageRatingByCourseId(courseId);
            long count = reviewRepository.countByCourseId(courseId);
            courseRepository.findById(courseId).ifPresent(course -> {
                course.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
                course.setReviewCount((int) count);
                courseRepository.save(course);
            });
        } catch (Exception e) {
            log.error("Failed to update course rating for {}: {}", courseId, e.getMessage());
        }
    }
}
