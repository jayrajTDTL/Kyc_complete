package com.company.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KycProcessResponseDto {
    private String status;
    private OcrData ocrData;
    private KycResult kycResult;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OcrData {
        private PanData pan;
        private AadhaarData aadhaar;
        private StatementData statement;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class PanData {
            private String pan_no;
            private String name;
            private String dob;
            private String father_name;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class AadhaarData {
            private String aadhaar_no;
            private String name;
            private String dob;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class StatementData {
            private String name;
            private String acc_no;
            private String ifsc_no;
            private String address;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycResult {
        private String status;
        private Integer identityScore;
        private Integer fraudScore;
        private Integer riskScore;
        private String finalName;
        private List<String> fraudSignals;
        private String message;
    }
}