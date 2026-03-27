package com.company.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycSummaryResponseDto {
    private String caseId;
    private String applicantName;
    private String status;
    private Integer riskScore;
    private String description;
}
