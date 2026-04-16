package com.company.kyc.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OcrResponseDto {
    private String panNumber;
    private String name;
    private String fathersName;
    private String dob;
    private String documentType; // "PAN", "AADHAAR", etc.
    private Double confidenceScore; // 0.0 - 1.0
    private String temporaryFilePath; // For audit trail
    private LocalDateTime extractedAt;
}