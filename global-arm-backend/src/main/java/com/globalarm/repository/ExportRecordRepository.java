
package com.globalarm.repository;

import com.globalarm.model.ExportRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportRecordRepository
        extends JpaRepository<ExportRecord, Long> {

    boolean existsByReference(String reference);
}
