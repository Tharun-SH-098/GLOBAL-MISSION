
package com.globalarm.repository;

import com.globalarm.model.ComplianceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplianceRecordRepository
        extends JpaRepository<ComplianceRecord, Long> {

    boolean existsByReference(String reference);
}
