
package com.globalarm.controller;

import com.globalarm.model.ComplianceRecord;
import com.globalarm.repository.ComplianceRecordRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class ComplianceController {

    private final ComplianceRecordRepository repository;

    private static final Set<String> ALLOWED_STATUSES = Set.of(
        "Pending",
        "Under Review",
        "Compliant",
        "Non-Compliant",
        "Expired"
    );

    public ComplianceController(
            ComplianceRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ComplianceRecord> getAllRecords() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createRecord(
            @RequestBody ComplianceRecord record) {

        if (record.getReference() == null
                || record.getReference().isBlank()
                || record.getRequirementName() == null
                || record.getRequirementName().isBlank()
                || record.getCategory() == null
                || record.getCategory().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Reference, requirement name, and category are required.")
            );
        }

        record.setReference(record.getReference().trim());

        if (repository.existsByReference(record.getReference())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message",
                    "A compliance record with this reference already exists.")
            );
        }

        if (record.getStatus() == null
                || record.getStatus().isBlank()) {
            record.setStatus("Pending");
        }

        if (!ALLOWED_STATUSES.contains(record.getStatus())) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid compliance status.")
            );
        }

        record.setId(null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repository.save(record));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return repository.findById(id)
            .map(record -> {
                String status = body.get("status");

                if (status == null
                        || !ALLOWED_STATUSES.contains(status)) {
                    return ResponseEntity.badRequest().body(
                        Map.of("message",
                            "Invalid compliance status.")
                    );
                }

                record.setStatus(status);

                return ResponseEntity.ok(repository.save(record));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
