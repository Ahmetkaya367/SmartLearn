package com.smartlearn.course.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "instructor_id", nullable = false)
    private UUID instructorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    private String category;
    private String level;
    private int studentCount;
    private double rating;
    private int reviewCount;
    private String duration;
    @Column(name = "is_bestseller")
    private boolean isBestseller;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "video_preview_url")
    private String videoPreviewUrl;

    @Column(name = "long_description", length = 5000)
    private String longDescription;

    @ElementCollection
    @CollectionTable(name = "learning_outcomes", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "outcome")
    private List<String> learningOutcomes;

    @ElementCollection
    @CollectionTable(name = "course_requirements", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "requirement")
    private List<String> requirements;

    @ElementCollection
    @CollectionTable(name = "target_audience", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "audience")
    private List<String> targetAudience;

    private String instructorBio;
    private String instructorImage;
    private String instructorTitle;
    private int instructorStudents;
    private int instructorCourses;
    private double instructorRating;

    private String language;
    private String lastUpdated;
    private boolean certificateIncluded;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Section> sections = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addSection(Section section) {
        sections.add(section);
        section.setCourse(this);
    }
}
