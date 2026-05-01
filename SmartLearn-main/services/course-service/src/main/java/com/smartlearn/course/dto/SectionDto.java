package com.smartlearn.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SectionDto {
    private UUID id;
    private String title;
    private int orderIndex;
    private List<LessonDto> lessons;
}
