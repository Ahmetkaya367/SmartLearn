package com.smartlearn.enrollment.repository;

import com.smartlearn.enrollment.domain.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {

    Optional<Certificate> findByCertificateCode(String certificateCode);

    Optional<Certificate> findByEnrollmentId(UUID enrollmentId);

    List<Certificate> findByUserId(UUID userId);

    List<Certificate> findByCourseId(UUID courseId);
}
