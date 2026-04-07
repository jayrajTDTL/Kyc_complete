

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

        JsonNode summaryNode = root.path("summary");
        JsonNode resultsNode = summaryNode.path("results");

        OcrCombinedResponseDto.OcrData ocrData = new OcrCombinedResponseDto.OcrData();

        /* ---------------- PAN ---------------- */
        String panSummary = resultsNode.path("pan_summary").asText("");
        if (!panSummary.isEmpty()) {
            OcrCombinedResponseDto.OcrData.PanData panData =
                    new OcrCombinedResponseDto.OcrData.PanData();

            panData.setName(extractValue(panSummary, "Name: "));
            panData.setDate_of_birth(extractValue(panSummary, "Dob: "));
            panData.setPan_no(extractValue(panSummary, "Pan: "));
            panData.setFather_name(null); // not present in new response

            ocrData.setPan(panData);
        }

        /* ---------------- AADHAAR ---------------- */
        String aadhaarSummary = resultsNode.path("aadhaar_summary").asText("");
        if (!aadhaarSummary.isEmpty()) {
            OcrCombinedResponseDto.OcrData.AadhaarData aadhaarData =
                    new OcrCombinedResponseDto.OcrData.AadhaarData();

            aadhaarData.setName(extractValue(aadhaarSummary, "Name: "));
            aadhaarData.setDate_of_birth(extractValue(aadhaarSummary, "Dob: "));
            aadhaarData.setAadhaar_no(extractValue(aadhaarSummary, "Aadhaar: "));

            ocrData.setAadhaar(aadhaarData);
        }

        /* ---------------- BANK STATEMENT ---------------- */
        String bankSummary = resultsNode.path("bank_summary").asText("");
        if (!bankSummary.isEmpty()) {
            OcrCombinedResponseDto.OcrData.StatementData statementData =
                    new OcrCombinedResponseDto.OcrData.StatementData();

            statementData.setName(extractValue(bankSummary, "Customer Name: "));
            statementData.setAccount_no(extractValue(bankSummary, "Account Number: "));
            statementData.setIfsc_code(extractValue(bankSummary, "Ifsc: "));
            statementData.setAddress(null); // not present in new response

            ocrData.setStatement(statementData);
        }

        combined.setOcrData(ocrData);

        /* ---------------- DECISION / KYC RESULT ---------------- */
        JsonNode crossDocNode = summaryNode.path("cross_document_comparison");

        OcrCombinedResponseDto.KycResult result = new OcrCombinedResponseDto.KycResult();

        // Use cross_document_comparison.decision as the verdict
        result.setStatus(crossDocNode.path("decision").asText());

        // identity_score mapped from average_name_score
        result.setIdentityScore(crossDocNode.path("average_name_score").asInt());

        // risk_score from overall_risk_score
        result.setRiskScore(summaryNode.path("overall_risk_score").asDouble());
        System.out.println("Risk Score: " + result.getRiskScore());
        if(result.getRiskScore() > 15){
            result.setStatus("Rejected");
        } else if(result.getRiskScore() > 5){
            result.setStatus("Rejected");
        } else {
            result.setStatus("Approved");
        }

        // fraud_score not present — default to 0
        result.setFraudScore(result.getRiskScore() > 10 ? 80 : 5); // simple heuristic for demo

        // finalName from PAN data parsed above
        result.setFinalName(
                ocrData.getPan() != null ? ocrData.getPan().getName() : ""
        );

        // message from overall_decision
        result.setMessage(summaryNode.path("overall_decision").asText());

        // fraud signals from cross_document_comparison.signals
        if (crossDocNode.has("signals")) {
            result.setFraudSignals(
                    objectMapper.convertValue(
                            crossDocNode.get("signals"),
                            new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                    )
            );
        }

        combined.setKycResult(result);

        System.out.println("FINAL DTO -> " + combined);

        return combined;
    }

    /**
     * Extracts a value from summary strings like:
     * "... Data fetched -> Name: ADITYA GORAKSHNATH PATARE, Dob: 2003-04-14, ..."
     * Splits on the label and takes everything up to the next comma or end of string.
     */
    private String extractValue(String text, String label) {
        int idx = text.indexOf(label);
        if (idx == -1) return null;
        String after = text.substring(idx + label.length());
        int comma = after.indexOf(',');
        return comma == -1 ? after.trim() : after.substring(0, comma).trim();
    }
}