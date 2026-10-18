package com.globalarm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_risk_findings")
public class TradeRiskFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recordType;

    @Column(nullable = false)
    private Long recordId;

    @Column(nullable = false)
    private String reference;

    @Column(nullable = false)
    private Integer riskScore;

    @Column(nullable = false)
    private String riskLevel;

    @Column(nullable = false, length = 3000)
    private String explanation;

    @Column(nullable = false)
    private String reviewStatus = "Open";

    private LocalDateTime analyzedAt;
    private String reviewedBy;
    private LocalDateTime reviewedAt;

    public TradeRiskFinding() {
    }

    @PrePersist
    public void beforeSave() {
        if (analyzedAt == null) {
            analyzedAt = LocalDateTime.now();
        }
        if (reviewStatus == null || reviewStatus.isBlank()) {
            reviewStatus = "Open";
        }
    }

    public Long getId() { return id; }

    public String getRecordType() { return recordType; }
    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getReference() { return reference; }
    public void setReference(String reference) {
        this.reference = reference;
    }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}