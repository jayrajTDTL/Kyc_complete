package com.company.kyc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AadhaarRequest {

    // "SEND_OTP" or "VERIFY_OTP"
    @NotBlank(message = "step is required")
    private String step;

    // Required for SEND_OTP step
    private String aadhaarNumber;

    // Required for VERIFY_OTP step
    private String referenceId;
    private String otp;
}