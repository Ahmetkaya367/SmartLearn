package com.smartlearn.enrollment.repository;

import com.smartlearn.enrollment.domain.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByUserId(UUID userId);

    List<Enrollment> findByCourseId(UUID courseId);
    
    List<Enrollment> findAllByCourseIdIn(List<UUID> courseIds);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM Enrollment e")
    Long countDistinctUsers();

    @Query("SELECT COUNT(e) FROM Enrollment e")
    Long countTotalEnrollments();

    @Query("SELECT SUM(e.progressPercent) FROM Enrollment e WHERE e.userId = :userId")
    Integer sumProgressByUserId(UUID userId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.courseId IN :courseIds")
    Long countEnrollmentsByCourseIds(List<UUID> courseIds);

    Long countByCourseId(UUID courseId);
}