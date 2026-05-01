package com.smartlearn.enrollment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollment_lesson_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "enrollment_id", nullable = false)
    private UUID enrollmentId;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "watched_seconds", nullable = false)
    @Builder.Default
    private int watchedSeconds = 0;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean isCompleted = false;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;
}
