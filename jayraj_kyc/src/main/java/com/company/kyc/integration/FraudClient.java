package com.company.kyc.integration;

import com.company.kyc.dto.FraudResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Component
@RequiredArgsConstructor
public class FraudClient {

    private final RestTemplate restTemplate;

    private static final String FRAUD_API_URL = "http://192.168.0.200:8000/ocr";

    public FraudResponseDto callFraudApi(String caseId) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> requestEntity = new HttpEntity<>(caseId, headers);

        ResponseEntity<FraudResponseDto> response = restTemplate.postForEntity(FRAUD_API_URL, requestEntity,
                FraudResponseDto.class);

        return response.getBody();
    }
}