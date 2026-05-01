package com.smartlearn.course.repository;

import com.smartlearn.course.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findAllByInstructorId(UUID instructorId);

    @Modifying
    @Transactional
    @Query("UPDATE Course c SET c.category = :newCategoryName WHERE c.category = :oldCategoryName")
    int updateCategoryNames(@Param("oldCategoryName") String oldCategoryName, @Param("newCategoryName") String newCategoryName);

    long countByCategory(String category);
}
