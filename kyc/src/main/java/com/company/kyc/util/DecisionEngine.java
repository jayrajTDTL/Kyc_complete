package com.company.kyc.util;

public class DecisionEngine {

    public static String decideStatus(int riskScore) {

        if (riskScore <= 30) {
            return "APPROVED";
        } else if (riskScore <= 60) {
            return "REVIEW";
        } else {
            return "REJECTED";
        }
    }
}