package com.smartlearn.enrollment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "enrollment_id", nullable = false, unique = true)
    private UUID enrollmentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "certificate_code", nullable = false, unique = true)
    private String certificateCode;

    @Column(name = "certificate_url")
    private String certificateUrl;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "course_title", nullable = false)
    private String courseTitle;

    @Column(name = "instructor_name")
    private String instructorName;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;
}
