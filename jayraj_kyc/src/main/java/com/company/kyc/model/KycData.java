package com.company.kyc.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_data")
@Data
public class KycData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id")
    private String caseId;

    // PAN data
    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "pan_name")
    private String panName;

    @Column(name = "pan_dob")
    private String panDob;

    @Column(name = "pan_father_name")
    private String panFatherName;

    // Aadhaar data
    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "aadhaar_name")
    private String aadhaarName;

    @Column(name = "aadhaar_dob")
    private String aadhaarDob;

    // Statement data
    @Column(name = "statement_name")
    private String statementName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "address")
    private String address;

    @Column(name = "document_type")
    private String documentType; // "PAN", "AADHAAR", etc.

    @Column(name = "confidence_score")
    private Double confidenceScore; // 0.0 - 1.0

    @Column(name = "extraction_timestamp")
    private LocalDateTime extractionTimestamp;

    @Column(name = "ocr_response_json", columnDefinition = "json")
    private String ocrResponseJson;

    @Column(name = "kyc_result_json", columnDefinition = "json")
    private String kycResultJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}