
package com.globalarm.controller;

import com.globalarm.model.ExportRecord;
import com.globalarm.repository.ExportRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/exports")
public class ExportController {

    private final ExportRecordRepository repository;

    private static final Set<String> ALLOWED_STATUSES =
            Set.of("Pending", "Processing", "Shipped",
                   "Delivered", "Rejected");

    public ExportController(ExportRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ExportRecord> getExports() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createExport(
            @RequestBody ExportRecord record) {

        if (record.getReference() == null
                || record.getReference().isBlank()
                || record.getProductName() == null
                || record.getProductName().isBlank()
                || record.getDestinationCountry() == null
                || record.getDestinationCountry().isBlank()
                || record.getQuantity() == null
                || record.getQuantity() <= 0) {

            return ResponseEntity.badRequest().body(
                    Map.of("message",
                    "Enter a reference, product, destination and positive quantity."));
        }

        String reference = record.getReference().trim();

        if (repository.existsByReference(reference)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message",
                    "This export reference already exists."));
        }

        record.setReference(reference);
        record.setProductName(record.getProductName().trim());
        record.setDestinationCountry(
                record.getDestinationCountry().trim());

        if (record.getStatus() == null
                || record.getStatus().isBlank()) {
            record.setStatus("Pending");
        }

        if (!ALLOWED_STATUSES.contains(record.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid export status."));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repository.save(record));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        ExportRecord record = repository.findById(id)
                .orElse(null);

        if (record == null) {
            return ResponseEntity.notFound().build();
        }

        String status = body.get("status");

        if (status == null
                || !ALLOWED_STATUSES.contains(status)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid export status."));
        }

        record.setStatus(status);

        return ResponseEntity.ok(repository.save(record));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExport(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
