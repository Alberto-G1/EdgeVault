package com.edgevault.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopUserActivityDto {
    private Long userId;
    private String username;
    private String fullName;
    private Long activityCount;
}
