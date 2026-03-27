package com.company.kyc.service;

import com.company.kyc.dto.FraudResultSummaryDto;
import com.company.kyc.dto.KycProcessResponseDto;
import com.company.kyc.dto.KycResultResponseDto;
import com.company.kyc.dto.KycSummaryResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface KycService {

        KycProcessResponseDto processKyc(MultipartFile panFile, MultipartFile aadharFile,
                        MultipartFile statementFile);

        KycResultResponseDto getKycResult(String caseId);

        KycSummaryResponseDto getKycSummary(String caseId);

        java.util.List<FraudResultSummaryDto> getAllFraudSummary();

        KycProcessResponseDto.KycResult getKycResultOnly(String caseId);

        /*
         * org.springframework.data.domain.Page<FraudResultSummaryDto>
         * getFraudSummaryPage(
         * org.springframework.data.domain.Pageable pageable);
         */
}