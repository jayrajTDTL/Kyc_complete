package com.company.kyc.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "fraud_result")
@Data
public class FraudResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id")
    private String caseId;

    @Column(name = "fraud_score")
    private Integer fraudScore;

    @Column(name = "identity_score")
    private Integer identityScore;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "kyc_status")
    private String kycStatus; // APPROVE, REJECT, etc.

    @Column(name = "final_name")
    private String finalName;

    @Column(name = "fraud_signals")
    private String fraudSignals; // JSON string of list

    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}