
package com.globalarm.controller;

import com.globalarm.model.DocumentRecord;
import com.globalarm.repository.DocumentRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class DocumentController {

    private final DocumentRecordRepository documentRepository;

    private static final Set<String> ALLOWED_STATUSES =
        Set.of("Pending", "Submitted", "Approved", "Rejected", "Expired");

    public DocumentController(
            DocumentRecordRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping
    public ResponseEntity<?> getDocuments() {
        return ResponseEntity.ok(documentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createDocument(
            @RequestBody DocumentRecord document) {

        if (isBlank(document.getReference())
                || isBlank(document.getDocumentName())
                || isBlank(document.getDocumentType())) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Reference, document name, and document type are required.")
            );
        }

        document.setReference(document.getReference().trim());
        document.setDocumentName(document.getDocumentName().trim());
        document.setDocumentType(document.getDocumentType().trim());

        if (documentRepository.existsByReference(document.getReference())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Document reference already exists.")
            );
        }

        if (document.getStatus() == null
                || document.getStatus().isBlank()) {
            document.setStatus("Pending");
        }

        if (!ALLOWED_STATUSES.contains(document.getStatus())) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid document status.")
            );
        }

        document.setId(null);
        document.setCreatedAt(null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentRepository.save(document));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        var optionalDocument = documentRepository.findById(id);

        if (optionalDocument.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String status = body.get("status");

        if (status == null || !ALLOWED_STATUSES.contains(status)) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid document status.")
            );
        }

        DocumentRecord document = optionalDocument.get();
        document.setStatus(status);

        return ResponseEntity.ok(documentRepository.save(document));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
