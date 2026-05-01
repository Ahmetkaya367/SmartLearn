package com.smartlearn.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private UUID instructorId;
    private String instructor; // Instructor name
    private String category;
    private String level;
    private Integer studentCount;
    private Double rating;
    private Integer reviewCount;
    private String duration;
    private Integer totalDurationSeconds;
    private Boolean isBestseller;
    private String updatedAt;
    private String thumbnail;

    // Details
    private String videoPreviewUrl;
    private String longDescription;
    private List<String> learningOutcomes;
    private List<String> requirements;
    private List<String> targetAudience;
    private String instructorBio;
    private String instructorImage;
    private String instructorTitle;
    private Integer instructorStudents;
    private Integer instructorCourses;
    private Double instructorRating;
    private String language;
    private String lastUpdated;
    private Boolean certificateIncluded;

    private String status;
    private List<SectionDto> sections;
}
