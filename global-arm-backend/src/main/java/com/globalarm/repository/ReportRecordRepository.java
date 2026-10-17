
package com.globalarm.repository;

import com.globalarm.model.ReportRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRecordRepository
        extends JpaRepository<ReportRecord, Long> {
}
