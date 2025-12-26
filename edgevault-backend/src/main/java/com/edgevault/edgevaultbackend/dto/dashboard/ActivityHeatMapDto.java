package com.edgevault.edgevaultbackend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityHeatMapDto {
    private int dayOfWeek; // 1=Monday, 7=Sunday
    private int hour; // 0-23
    private long activityCount;
}
