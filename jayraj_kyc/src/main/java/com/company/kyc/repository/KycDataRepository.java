package com.company.kyc.repository;

import com.company.kyc.model.KycData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KycDataRepository extends JpaRepository<KycData, Long> {
    Optional<KycData> findByCaseId(String caseId);
}