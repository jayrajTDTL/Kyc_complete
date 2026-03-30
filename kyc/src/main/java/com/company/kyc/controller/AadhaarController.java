package com.company.kyc.controller;

import com.company.kyc.dto.AadhaarRequest;
import com.company.kyc.dto.AadhaarResponse;
import com.company.kyc.service.AadhaarService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/aadhaar")
public class AadhaarController {

    private final AadhaarService aadhaarService;

    public AadhaarController(AadhaarService aadhaarService) {
        this.aadhaarService = aadhaarService;
    }

    // ✅ Single API handles both steps
    @PostMapping("/verify")
    public ResponseEntity<AadhaarResponse> verify(
            @Valid @RequestBody AadhaarRequest request) {

        AadhaarResponse response = aadhaarService.process(request);
        return ResponseEntity.ok(response);
    }
}