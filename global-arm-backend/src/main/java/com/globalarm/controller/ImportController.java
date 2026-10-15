
package com.globalarm.controller;

import com.globalarm.model.ImportRecord;
import com.globalarm.repository.ImportRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/imports")
public class ImportController {

    private final ImportRecordRepository repository;

    public ImportController(ImportRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ImportRecord> getAllImports() {
        return repository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ImportRecord createImport(
            @RequestBody ImportRecord record) {

        if (record.getReference() == null
                || record.getReference().isBlank()
                || record.getSupplier() == null
                || record.getSupplier().isBlank()
                || record.getCountry() == null
                || record.getCountry().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reference, supplier, and country are required");
        }

        record.setReference(record.getReference().trim());
        record.setSupplier(record.getSupplier().trim());
        record.setCountry(record.getCountry().trim());

        if (record.getStatus() == null
                || record.getStatus().isBlank()) {
            record.setStatus("Pending");
        }

        if (repository.existsByReference(record.getReference())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This import reference already exists");
        }

        return repository.save(record);
    }

    @PatchMapping("/{id}/status")
    public ImportRecord updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        ImportRecord record = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Import record not found"));

        String status = body.get("status");
        Set<String> allowedStatuses =
                Set.of("Pending", "In Transit", "Completed", "Rejected");

        if (status == null || !allowedStatuses.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid import status");
        }

        record.setStatus(status);
        return repository.save(record);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImport(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Import record not found");
        }

        repository.deleteById(id);
    }
}
