package com.company.kyc.service;

import com.company.kyc.dto.AadhaarRequest;
import com.company.kyc.dto.AadhaarResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AadhaarService {

    @Value("${sandbox.api.key}")
    private String apiKey;

    @Value("${sandbox.secret.key}")
    private String secretKey;

    @Value("${sandbox.base.url}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AadhaarService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ─── Get Access Token ─────────────────────────────
    private String getAccessToken() throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);
        headers.set("x-api-secret", secretKey);
        headers.set("x-api-version", "1.0");
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>("{}", headers);

        // ✅ Use String.class instead of JsonNode.class
        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/authenticate",
            HttpMethod.POST,
            entity,
            String.class
        );

        // ✅ Parse manually
        JsonNode json = objectMapper.readTree(response.getBody());
        return json.get("data").get("access_token").asText();
    }

    // ─── Build Common Headers ─────────────────────────
    private HttpHeaders buildHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        headers.set("x-api-key", apiKey);
        headers.set("x-api-version", "2.0");
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    // ─── Main Process Method ──────────────────────────
    public AadhaarResponse process(AadhaarRequest request) {
        switch (request.getStep().toUpperCase()) {
            case "SEND_OTP":   return sendOtp(request.getAadhaarNumber());
            case "VERIFY_OTP": return verifyOtp(request.getReferenceId(), request.getOtp());
            default:
                return AadhaarResponse.builder()
                        .success(false)
                        .message("Invalid step. Use SEND_OTP or VERIFY_OTP")
                        .build();
        }
    }

    // ─── Step 1: Send OTP ─────────────────────────────
    private AadhaarResponse sendOtp(String aadhaarNumber) {
        if (aadhaarNumber == null || !aadhaarNumber.matches("\\d{12}")) {
            return AadhaarResponse.builder()
                    .success(false)
                    .step("SEND_OTP")
                    .message("Invalid Aadhaar number. Must be 12 digits.")
                    .build();
        }

        try {
            String token = getAccessToken();

            ObjectNode body = objectMapper.createObjectNode();
            body.put("@entity", "in.co.sandbox.kyc.aadhaar.okyc.otp.request");
            body.put("aadhaar_number", aadhaarNumber);
            body.put("consent", "Y");
            body.put("reason", "For KYC verification");

            HttpEntity<String> entity = new HttpEntity<>(
                objectMapper.writeValueAsString(body), buildHeaders(token)
            );

           // ✅ Add this after getting response to see full JSON
            ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/kyc/aadhaar/okyc/otp",
                HttpMethod.POST,
                entity,
                String.class
            );

            // 👇 ADD THIS LINE temporarily to see full response
            System.out.println("SANDBOX RESPONSE: " + response.getBody());

            JsonNode json = objectMapper.readTree(response.getBody());
            String referenceId = json.get("data").get("reference_id").asText();

            // ✅ Parse manually with null safety
            //JsonNode json = objectMapper.readTree(response.getBody());

            System.out.println("FULL RESPONSE: " + json.toPrettyString()); // 👈 debug log

            JsonNode dataNode = json.get("data");

            if (dataNode == null) {
                return AadhaarResponse.builder()
                        .success(false)
                        .step("SEND_OTP")
                        .message("Unexpected response from Sandbox: " + response.getBody())
                        .build();
            }

            // ✅ Try both field names
            referenceId = null;
            if (dataNode.get("client_id") != null) {
                referenceId = dataNode.get("client_id").asText();
            } else if (dataNode.get("ref_id") != null) {
                referenceId = dataNode.get("ref_id").asText();
            } else if (dataNode.get("reference_id") != null) {
                referenceId = dataNode.get("reference_id").asText();
            }

            if (referenceId == null) {
                return AadhaarResponse.builder()
                        .success(false)
                        .step("SEND_OTP")
                        .message("Could not find reference ID in response: " + dataNode.toPrettyString())
                        .build();
            }

            return AadhaarResponse.builder()
                    .success(true)
                    .step("SEND_OTP")
                    .referenceId(referenceId)
                    .message("OTP sent to Aadhaar-linked mobile number")
                    .build();

        } catch (Exception e) {
            return AadhaarResponse.builder()
                    .success(false)
                    .step("SEND_OTP")
                    .message("Failed to send OTP: " + e.getMessage())
                    .build();
        }
    }

    // ─── Step 2: Verify OTP ───────────────────────────
    // ─── Step 2: Verify OTP ───────────────────────────
    // ─── Step 2: Verify OTP ───────────────────────────
    private AadhaarResponse verifyOtp(String referenceId, String otp) {
        if (referenceId == null || otp == null) {
            return AadhaarResponse.builder()
                    .success(false)
                    .step("VERIFY_OTP")
                    .message("referenceId and otp are required")
                    .build();
        }

        try {
            String token = getAccessToken();

            ObjectNode body = objectMapper.createObjectNode();
            body.put("@entity", "in.co.sandbox.kyc.aadhaar.okyc.request");
            body.put("reference_id", referenceId);
            body.put("otp", otp);

            System.out.println("VERIFY REQUEST BODY: " + body.toPrettyString());

            HttpEntity<String> entity = new HttpEntity<>(
                objectMapper.writeValueAsString(body), buildHeaders(token)
            );

            ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/kyc/aadhaar/okyc/otp/verify",
                HttpMethod.POST,
                entity,
                String.class
            );

            System.out.println("VERIFY RESPONSE: " + response.getBody());

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode data = root.get("data");

            // ✅ Null check on data node
            if (data == null || data.isNull()) {
                return AadhaarResponse.builder()
                        .success(false)
                        .step("VERIFY_OTP")
                        .message("Empty data in response: " + root.toPrettyString())
                        .build();
            }

            // ✅ Safe field extraction — handles missing fields gracefully
            return AadhaarResponse.builder()
                    .success(true)
                    .step("VERIFY_OTP")
                    .name(data.has("name")           ? data.get("name").asText()           : null)
                    .dob(data.has("date_of_birth")   ? data.get("date_of_birth").asText()  :
                        data.has("dob")             ? data.get("dob").asText()            : null)
                    .gender(data.has("gender")       ? data.get("gender").asText()         : null)
                    .address(data.has("full_address")? data.get("full_address").asText()   :
                            data.has("address")     ? data.get("address").asText()        : null)
                    .careOf(data.has("care_of")      ? data.get("care_of").asText()        : null)
                    .yearOfBirth(data.has("year_of_birth") ? data.get("year_of_birth").asText() : null)
                    .message("Aadhaar verified successfully")
                    .build();

        } catch (Exception e) {
            return AadhaarResponse.builder()
                    .success(false)
                    .step("VERIFY_OTP")
                    .message("Verification failed: " + e.getMessage())
                    .build();
        }
    }
}