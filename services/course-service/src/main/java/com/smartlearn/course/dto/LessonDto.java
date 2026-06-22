package com.smartlearn.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LessonDto {
    private UUID id;
    private String title;
    private String videoUrl;
    private String duration; // String format "5:32" as in frontend
    private int durationSeconds;
    private String type; // video, article, quiz
    private int orderIndex;
    private boolean isPreview;
    private int version;
}
