package com.globalarm.service;

import com.globalarm.model.ExportRecord;
import com.globalarm.model.ImportRecord;
import com.globalarm.model.TradeRiskFinding;
import com.globalarm.repository.ExportRecordRepository;
import com.globalarm.repository.ImportRecordRepository;
import com.globalarm.repository.TradeRiskFindingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TradeRiskService {

    private final ImportRecordRepository imports;
    private final ExportRecordRepository exports;
    private final TradeRiskFindingRepository findings;

    public TradeRiskService(
            ImportRecordRepository imports,
            ExportRecordRepository exports,
            TradeRiskFindingRepository findings) {
        this.imports = imports;
        this.exports = exports;
        this.findings = findings;
    }

    @Transactional
    public int analyze() {
        int analyzed = 0;

        for (ImportRecord record : imports.findAll()) {
            List<String> reasons = new ArrayList<>();
            String status = record.getStatus();

            if ("Rejected".equalsIgnoreCase(status)) {
                reasons.add("Import has Rejected status.");
            } else if ("Pending".equalsIgnoreCase(status)) {
                reasons.add("Import is still Pending.");
            }

            if (record.getSupplier() == null
                    || record.getSupplier().isBlank()) {
                reasons.add("Supplier information is missing.");
            }

            if (record.getCountry() == null
                    || record.getCountry().isBlank()) {
                reasons.add("Country information is missing.");
            }

            analyzed += saveFinding(
                    "IMPORT", record.getId(), record.getReference(),
                    reasons);
        }

        for (ExportRecord record : exports.findAll()) {
            List<String> reasons = new ArrayList<>();
            String status = record.getStatus();

            if ("Rejected".equalsIgnoreCase(status)) {
                reasons.add("Export has Rejected status.");
            } else if ("Pending".equalsIgnoreCase(status)
                    || "Processing".equalsIgnoreCase(status)) {
                reasons.add("Export has not yet been shipped or delivered.");
            }

            if (record.getQuantity() != null
                    && record.getQuantity() >= 10000) {
                reasons.add(
                    "Quantity is at least 10,000 units; verify the order.");
            }

            if (record.getProductName() == null
                    || record.getProductName().isBlank()) {
                reasons.add("Product information is missing.");
            }

            if (record.getDestinationCountry() == null
                    || record.getDestinationCountry().isBlank()) {
                reasons.add("Destination country is missing.");
            }

            analyzed += saveFinding(
                    "EXPORT", record.getId(), record.getReference(),
                    reasons);
        }

        return analyzed;
    }

    private int saveFinding(
            String type, Long recordId, String reference,
            List<String> reasons) {

        // Skip records without a risk indicator.
        if (reasons.isEmpty()) {
            return 0;
        }

        // Avoid creating a duplicate finding for the same record.
        if (findings.existsByRecordTypeAndRecordId(type, recordId)) {
            return 0;
        }

        int score = 0;

        for (String reason : reasons) {
            if (reason.contains("Rejected")) {
                score += 50;
            } else if (reason.contains("Pending")
                    || reason.contains("not yet")) {
                score += 20;
            } else if (reason.contains("10,000")) {
                score += 25;
            } else {
                score += 15;
            }
        }

        score = Math.min(score, 100);

        TradeRiskFinding finding = new TradeRiskFinding();
        finding.setRecordType(type);
        finding.setRecordId(recordId);
        finding.setReference(
                reference == null ? "N/A" : reference);
        finding.setRiskScore(score);
        finding.setRiskLevel(
                score >= 70 ? "High"
                : score >= 35 ? "Medium"
                : "Low");
        finding.setExplanation(String.join(" ", reasons));
        finding.setReviewStatus("Open");

        findings.save(finding);
        return 1;
    }
}