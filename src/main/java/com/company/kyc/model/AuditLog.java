package com.company.kyc.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id")
    private String caseId;

    private String step; // BINARY_INGESTION, AI_IDENTIFICATION, AI_EXTRACTION, NORMALIZATION,
                         // PAYLOAD_DELIVERY

    @Column(columnDefinition = "TEXT")
    private String stepDetails; // JSON details of each step

    @Column(name = "step_status")
    private String stepStatus; // SUCCESS, FAILURE, SKIPPED

    private LocalDateTime timestamp;

    @Column(name = "duration_ms")
    private Long durationMs; // Step execution time in milliseconds

    @Column(name = "sequence_order")
    private Integer sequenceOrder; // 1, 2, 3, 4, 5 for each step
}