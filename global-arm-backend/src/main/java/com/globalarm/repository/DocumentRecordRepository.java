
package com.globalarm.repository;

import com.globalarm.model.DocumentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRecordRepository
        extends JpaRepository<DocumentRecord, Long> {

    boolean existsByReference(String reference);
}
