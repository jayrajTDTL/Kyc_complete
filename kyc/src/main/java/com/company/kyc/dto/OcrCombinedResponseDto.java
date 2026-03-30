
package com.company.kyc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class OcrCombinedResponseDto {
    private String status;
    private OcrData ocrData;
    private KycResult kycResult;

    @Data
    public static class OcrData {
        private PanData pan;
        private AadhaarData aadhaar;
        private StatementData statement;

        @Data
        public static class PanData {
            @JsonProperty("pan_no")
            private String pan_no;

            @JsonProperty("name")
            private String name;

            @JsonProperty("dob")
            private String date_of_birth;

            @JsonProperty("father_name")
            private String father_name;
        }

        @Data
        public static class AadhaarData {
            @JsonProperty("aadhaar_no")
            private String aadhaar_no;

            @JsonProperty("name")
            private String name;

            @JsonProperty("dob")
            private String date_of_birth;
        }

        @Data
        public static class StatementData {
            @JsonProperty("acc_no")
            private String account_no;

            @JsonProperty("ifsc_no")
            private String ifsc_code;

            @JsonProperty("name")
            private String name;

            @JsonProperty("address")
            private String address;
        }
    }

    @Data
    public static class KycResult {
        private String status;
        private Integer identityScore;
        private Integer fraudScore;
        private Double riskScore;
        private String finalName;
        private List<String> fraudSignals;
        private String message;
    }
}