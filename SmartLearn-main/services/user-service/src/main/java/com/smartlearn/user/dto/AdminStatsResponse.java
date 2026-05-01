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
public class AdminStatsResponse {
    private Long totalUsers;
    private Long totalCourses;
    private double totalRevenue;
    private double growthRate;
    private List<RecentUser> recentUsers;
    private List<PendingApproval> pendingApprovals;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentUser {
        private String id;
        private String name;
        private String email;
        private String joinedAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PendingApproval {
        private String id;
        private String title;
        private String instructor;
        private String submittedAt;
    }
}
