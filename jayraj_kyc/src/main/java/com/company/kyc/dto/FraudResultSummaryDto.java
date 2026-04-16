package com.company.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudResultSummaryDto {
    private String caseId;
    private String finalName;
    private String kycStatus;
    private Double riskScore;
    private String message;
}
