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
public class StudentStatsResponse {
    private List<String> enrolledCourses;
    private String learningTime;
    private int certificates;
    private List<InProgressCourse> inProgress;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InProgressCourse {
        private String courseId;
        private int progress;
        private String lastAccessed;
    }
}
