package com.company.kyc.util;

public class RiskScoreCalculator {

    public static int calculateRiskScore(int fraudScore, boolean panValid, boolean aadhaarValid, boolean nameMatch) {

        int risk = fraudScore;

        if (!panValid) {
            risk += 20;
        }

        if (!aadhaarValid) {
            risk += 20;
        }

        if (!nameMatch) {
            risk += 10;
        }

        return risk;
    }
}