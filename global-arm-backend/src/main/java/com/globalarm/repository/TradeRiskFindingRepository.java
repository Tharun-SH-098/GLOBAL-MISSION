package com.globalarm.repository;

import com.globalarm.model.TradeRiskFinding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeRiskFindingRepository
        extends JpaRepository<TradeRiskFinding, Long> {

    List<TradeRiskFinding>
        findAllByOrderByAnalyzedAtDesc();

    boolean existsByRecordTypeAndRecordId(
        String recordType, Long recordId);
}