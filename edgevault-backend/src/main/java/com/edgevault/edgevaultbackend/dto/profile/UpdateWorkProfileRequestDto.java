package com.edgevault.edgevaultbackend.dto.profile;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateWorkProfileRequestDto {
    private String employeeId;
    private String jobTitle;
    private LocalDate dateJoined;
    private String supervisorName;
}