

package com.company.kyc.integration;

import com.company.kyc.dto.OcrCombinedResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class OcrClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String OCR_BASE_URL = "http://0.0.0.0:8000/kyc/upload-and-check-all";

    /**
     * Call consolidated OCR endpoint with PAN, Aadhaar and statement files.
     */
    public OcrCombinedResponseDto callOcrApi(
            MultipartFile panFile,
            MultipartFile aadhaarFile,
            MultipartFile statementFile) {

        long startTime = System.currentTimeMillis();

        try {
            log.info("[OCR] Calling OCR Process API");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("pan_file", toResource(panFile));
            body.add("aadhaar_file", toResource(aadhaarFile));
            body.add("bank_file", toResource(statementFile));
            body.add("provider", "auto");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(OCR_BASE_URL, requestEntity, String.class);
            long duration = System.currentTimeMillis() - startTime;

            if (response.getStatusCode() != HttpStatus.OK) {
                log.error("[OCR] API returned non-200 status: {}", response.getStatusCode());
                throw new RuntimeException("OCR API returned status: " + response.getStatusCode());
            }

            log.info("[OCR] OCR response received in {} ms", duration);
            log.debug("[OCR] Response body: {}", response.getBody());
            return parseCombinedResponse(response.getBody());

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[OCR] Error calling OCR service ({} ms): {}", duration, e.getMessage());
            throw new RuntimeException("Error calling OCR service", e);
        }
    }

    private ByteArrayResource toResource(MultipartFile file) {
        try {
            return new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (Exception e) {
            throw new RuntimeException("Failed to read multipart file " + file.getOriginalFilename(), e);
        }
    }

    private OcrCombinedResponseDto parseCombinedResponse(String responseBody) throws Exception {

        System.out.println("Response Body: " + responseBody);

        JsonNode root = objectMapper.readTree(responseBody);
        OcrCombinedResponseDto combined = new OcrCombinedResponseDto();

        combined.setStatus(root.path("status").asText());

        if (root.has("documents")) {

            JsonNode documentsNode = root.get("documents");
            OcrCombinedResponseDto.OcrData ocrData = new OcrCombinedResponseDto.OcrData();

            /* ---------------- PAN ---------------- */
            if (documentsNode.has("pan")) {

                JsonNode panNode = documentsNode.get("pan").path("ocr_data");

                if (!panNode.isMissingNode()) {

                    OcrCombinedResponseDto.OcrData.PanData panData =
                            new OcrCombinedResponseDto.OcrData.PanData();

                    panData.setPan_no(panNode.path("pan").asText());
                    panData.setName(panNode.path("name").asText());
                    panData.setDate_of_birth(panNode.path("dob").asText());
                    panData.setFather_name(panNode.path("father_name").asText());

                    ocrData.setPan(panData);
                }
            }

            /* ---------------- AADHAAR ---------------- */
            if (documentsNode.has("aadhaar")) {

                JsonNode aadhaarNode = documentsNode.get("aadhaar").path("ocr_data");

                if (!aadhaarNode.isMissingNode()) {

                    OcrCombinedResponseDto.OcrData.AadhaarData aadhaarData =
                            new OcrCombinedResponseDto.OcrData.AadhaarData();

                    aadhaarData.setAadhaar_no(aadhaarNode.path("aadhaar").asText());
                    aadhaarData.setName(aadhaarNode.path("name").asText());
                    aadhaarData.setDate_of_birth(aadhaarNode.path("dob").asText());

                    ocrData.setAadhaar(aadhaarData);
                }
            }

            /* ---------------- BANK STATEMENT ---------------- */
            if (documentsNode.has("bank")) {

                JsonNode bankNode = documentsNode.get("bank").path("ocr_data");

                if (!bankNode.isMissingNode()) {

                    OcrCombinedResponseDto.OcrData.StatementData statementData =
                            new OcrCombinedResponseDto.OcrData.StatementData();

                    statementData.setAccount_no(bankNode.path("account_number").asText());
                    statementData.setIfsc_code(bankNode.path("ifsc").asText(null));
                    statementData.setName(bankNode.path("customer_name").asText());
                    statementData.setAddress(bankNode.path("address").asText());

                    ocrData.setStatement(statementData);
                }
            }

            combined.setOcrData(ocrData);
        }

        /* ---------------- DECISION / KYC RESULT ---------------- */

        if (root.has("decision")) {

            JsonNode decisionNode = root.get("decision");

            OcrCombinedResponseDto.KycResult result =
                    new OcrCombinedResponseDto.KycResult();

            result.setStatus(decisionNode.path("verdict").asText());
            result.setIdentityScore(decisionNode.path("identity_score").asInt());
            result.setFraudScore(decisionNode.path("fraud_score").asInt()); // not present in API
            result.setRiskScore(Double.valueOf(decisionNode.path("risk_score").asInt())); // not present in API
            result.setFinalName(
                    root.path("documents")
                            .path("pan")
                            .path("normalized_data")
                            .path("name")
                            .asText()
            );
            result.setMessage(decisionNode.path("message").asText());

            if (decisionNode.has("signals")) {
                result.setFraudSignals(
                        objectMapper.convertValue(
                                decisionNode.get("signals"),
                                new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                        )
                );
            }

            combined.setKycResult(result);
        }

        System.out.println("FINAL DTO -> " + combined);

        return combined;
    }
}