package com.company.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycResultResponseDto {

    private String caseId;
    private String status; // APPROVED, REJECTED, FAILED, PROCESSING

    // Extracted Data Fields
    private String pan;
    private String name;
    private String fathersName;
    private String dob;
    private Double confidenceScore;
    private Boolean dataComplete; // true if all required fields extracted

    // Validation & Risk
    private Integer riskScore;
    private List<String> fraudFlags;
    private String displayMessage; // User-friendly message
}