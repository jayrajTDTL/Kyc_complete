package com.company.kyc.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_case")
@Data
public class KycCase {

    @Id
    @Column(name = "case_id")
    private String caseId;

    private String status; // PROCESSING, COMPLETED, FAILED

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "processing_start_time")
    private LocalDateTime processingStartTime;

    @Column(name = "processing_end_time")
    private LocalDateTime processingEndTime;

    @Column(name = "total_processing_time_ms")
    private Long totalProcessingTimeMs;

    @Column(name = "current_pipeline_phase")
    private String currentPipelinePhase; // BINARY_INGESTION, AI_IDENTIFICATION, etc.
}