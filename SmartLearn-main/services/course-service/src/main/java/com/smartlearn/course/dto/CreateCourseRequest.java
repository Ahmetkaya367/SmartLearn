package com.smartlearn.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCourseRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String level;
    private String thumbnail;
}
