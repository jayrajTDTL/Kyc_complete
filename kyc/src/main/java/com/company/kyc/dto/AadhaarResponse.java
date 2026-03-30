package com.company.kyc.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AadhaarResponse {
    private boolean success;
    private String step;
    private String message;

    // Returned after SEND_OTP
    private String referenceId;

    // Returned after VERIFY_OTP
    private String name;
    private String dob;
    private String gender;
    private String address;
    private String careOf;
    private String yearOfBirth;
}