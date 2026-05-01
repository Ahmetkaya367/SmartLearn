package com.smartlearn.course.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "type", nullable = false, length = 20)
    @Builder.Default
    private String type = "video";

    @Column(name = "order_index")
    private int orderIndex;

    @Column(name = "is_preview")
    @Builder.Default
    private boolean isPreview = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;
}
