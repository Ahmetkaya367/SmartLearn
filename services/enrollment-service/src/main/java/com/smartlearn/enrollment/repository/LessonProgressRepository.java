package com.smartlearn.enrollment.repository;

import com.smartlearn.enrollment.domain.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(UUID enrollmentId, UUID lessonId);
    List<LessonProgress> findByEnrollmentId(UUID enrollmentId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByLessonId(UUID lessonId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(lp.watchedSeconds) FROM LessonProgress lp JOIN Enrollment e ON lp.enrollmentId = e.id WHERE e.userId = :userId")
    Integer getTotalWatchedSecondsByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT lp FROM LessonProgress lp WHERE lp.enrollmentId = :enrollmentId ORDER BY lp.lastUpdatedAt DESC LIMIT 1")
    Optional<LessonProgress> findLastWatchedLesson(@org.springframework.data.repository.query.Param("enrollmentId") UUID enrollmentId);
}
