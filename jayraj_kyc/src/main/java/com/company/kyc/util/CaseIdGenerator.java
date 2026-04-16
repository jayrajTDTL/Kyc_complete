package com.company.kyc.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class CaseIdGenerator {

    private static final AtomicInteger counter = new AtomicInteger(1);
    private static final String PREFIX = "KYC";

    public static String generateCaseId() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = counter.getAndIncrement();
        return PREFIX + date + String.format("%03d", count);
    }
}