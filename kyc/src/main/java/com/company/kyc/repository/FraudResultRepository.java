package com.company.kyc.repository;

import com.company.kyc.model.FraudResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;


import java.util.*;

@Repository
public interface FraudResultRepository extends JpaRepository<FraudResult, Long> {
    
    Optional<FraudResult> findByCaseId(String caseId);

    @Query("SELECT f FROM FraudResult f ORDER BY f.id DESC")
    List<FraudResult> findAllOrderByIdDesc();
}