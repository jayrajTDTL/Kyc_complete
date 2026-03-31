package com.company.kyc.controller;

import com.company.kyc.dto.KycProcessResponseDto;
import com.company.kyc.dto.KycResultResponseDto;
import com.company.kyc.dto.KycSummaryResponseDto;
import com.company.kyc.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://192.168.0.132:3000/")
@CrossOrigin(origins = "http://localhost:3000/")
public class KycController {

    private final KycService kycService;

    // API 1 — Upload & Process KYC (PAN + Aadhaar + Statement)
    @PostMapping("/process")
    public ResponseEntity<KycProcessResponseDto> processKyc(
            @RequestParam("pan") MultipartFile panFile,
            @RequestParam("aadhaar") MultipartFile aadharFile,
            @RequestParam("bank") MultipartFile statementFile) {
        KycProcessResponseDto response = kycService.processKyc(panFile, aadharFile, statementFile);
        System.out.println(response);
        return ResponseEntity.ok(response);
    }

    // API 2 — Get KYC Result
    @GetMapping("/result/{caseId}")
    public ResponseEntity<KycResultResponseDto> getKycResult(@PathVariable String caseId) {
        KycResultResponseDto response = kycService.getKycResult(caseId);
        return ResponseEntity.ok(response);
    }

    // API 3 — Get KYC Summary for frontend list
    @GetMapping("/summary/{caseId}")
    public ResponseEntity<KycSummaryResponseDto> getKycSummary(@PathVariable String caseId) {
        KycSummaryResponseDto response = kycService.getKycSummary(caseId);
        return ResponseEntity.ok(response);
    }

    // API 4 — Get all fraud result summaries
    @GetMapping("/fraud-summary")
    public ResponseEntity<java.util.List<com.company.kyc.dto.FraudResultSummaryDto>> getAllFraudSummary() {
        java.util.List<com.company.kyc.dto.FraudResultSummaryDto> response = kycService.getAllFraudSummary();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/kyc-result/{caseId}")
    public ResponseEntity<KycProcessResponseDto.KycResult> getKycResultOnly(@PathVariable String caseId) {
        return ResponseEntity.ok(kycService.getKycResultOnly(caseId));
    }
}