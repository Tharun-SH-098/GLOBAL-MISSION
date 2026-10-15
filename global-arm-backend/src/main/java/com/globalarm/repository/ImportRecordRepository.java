
package com.globalarm.repository;

import com.globalarm.model.ImportRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportRecordRepository
        extends JpaRepository<ImportRecord, Long> {

    boolean existsByReference(String reference);
}
