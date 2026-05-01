package com.smartlearn.course.repository;

import com.smartlearn.course.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByCourseId(UUID courseId);
    Optional<Review> findByUserIdAndCourseId(UUID userId, UUID courseId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.courseId = :courseId")
    Double findAverageRatingByCourseId(@Param("courseId") UUID courseId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.courseId = :courseId")
    long countByCourseId(@Param("courseId") UUID courseId);
}
