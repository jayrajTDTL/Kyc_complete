

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

@Component
@RequiredArgsConstructor
@Slf4j
public class OcrClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String OCR_BASE_URL = "http://192.168.0.30:8000/ocr/process";

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
            body.add("pan", toResource(panFile));
            body.add("aadhaar", toResource(aadhaarFile));
            body.add("statement", toResource(statementFile));
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
        JsonNode root = objectMapper.readTree(responseBody);
        OcrCombinedResponseDto combined = new OcrCombinedResponseDto();

        combined.setStatus(root.get("status").asText());

        if (root.has("ocr_data")) {
            JsonNode ocrDataNode = root.get("ocr_data");
            OcrCombinedResponseDto.OcrData ocrData = new OcrCombinedResponseDto.OcrData();

            if (ocrDataNode.has("pan")) {
                ocrData.setPan(objectMapper.treeToValue(
                        ocrDataNode.get("pan"), OcrCombinedResponseDto.OcrData.PanData.class));
            }

            if (ocrDataNode.has("aadhaar")) {
                ocrData.setAadhaar(objectMapper.treeToValue(
                        ocrDataNode.get("aadhaar"), OcrCombinedResponseDto.OcrData.AadhaarData.class));
            }

            if (ocrDataNode.has("statement")) {
                ocrData.setStatement(objectMapper.treeToValue(
                        ocrDataNode.get("statement"), OcrCombinedResponseDto.OcrData.StatementData.class));
            }

            combined.setOcrData(ocrData);
        }

        if (root.has("kyc_result")) {
            combined.setKycResult(objectMapper.treeToValue(
                    root.get("kyc_result"), OcrCombinedResponseDto.KycResult.class));
        }

        return combined;
    }
}