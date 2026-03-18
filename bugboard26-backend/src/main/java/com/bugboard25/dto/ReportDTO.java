package com.bugboard25.dto;

import java.util.List;

public class ReportDTO {
    private long openIssues;
    private long managedIssues;
    private String avgResolutionTime; // Formatted string (e.g., "2.5")
    private List<UserPerformanceDTO> userPerformance;
    private boolean isSingleUser;

    public ReportDTO(long openIssues, long managedIssues, String avgResolutionTime,
            List<UserPerformanceDTO> userPerformance, boolean isSingleUser) {
        this.openIssues = openIssues;
        this.managedIssues = managedIssues;
        this.avgResolutionTime = avgResolutionTime;
        this.userPerformance = userPerformance;
        this.isSingleUser = isSingleUser;
    }

    // Getters
    public long getOpenIssues() {
        return openIssues;
    }

    public long getManagedIssues() {
        return managedIssues;
    }

    public String getAvgResolutionTime() {
        return avgResolutionTime;
    }

    public List<UserPerformanceDTO> getUserPerformance() {
        return userPerformance;
    }

    public boolean isSingleUser() {
        return isSingleUser;
    }

    public static class UserPerformanceDTO {
        private String name;
        private long bugRisolti;

        public UserPerformanceDTO(String name, long bugRisolti) {
            this.name = name;
            this.bugRisolti = bugRisolti;
        }

        public String getName() {
            return name;
        }

        public long getBugRisolti() {
            return bugRisolti;
        }
    }
}
