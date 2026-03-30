package com.company.kyc.repository;

import com.company.kyc.model.FraudResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FraudResultRepository extends JpaRepository<FraudResult, Long> {
    Optional<FraudResult> findByCaseId(String caseId);
}