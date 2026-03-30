package com.company.kyc.repository;

import com.company.kyc.model.KycCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KycCaseRepository extends JpaRepository<KycCase, String> {
}