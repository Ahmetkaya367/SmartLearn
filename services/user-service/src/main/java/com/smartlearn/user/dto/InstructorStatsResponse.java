package com.smartlearn.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InstructorStatsResponse {
    private Long totalCourses;
    private Long totalStudents;
    private double totalRevenue;
    private double thisMonthRevenue;
    private List<String> myCourses;
}
