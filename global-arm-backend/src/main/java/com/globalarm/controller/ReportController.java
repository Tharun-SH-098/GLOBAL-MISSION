
package com.globalarm.controller;

import com.globalarm.model.ReportRecord;
import com.globalarm.repository.ReportRecordRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class ReportController {

    private final ReportRecordRepository reportRepository;

    private static final Set<String> ALLOWED_STATUSES =
        Set.of("Pending", "Under Review", "Approved", "Rejected");

    public ReportController(ReportRecordRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // ADMIN and OFFICER can submit report details.
    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody ReportRecord report,
            Authentication authentication) {

        if (report.getReportName() == null
                || report.getReportName().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Report name is required.")
            );
        }

        report.setReportName(report.getReportName().trim());

        if (report.getDescription() != null) {
            report.setDescription(report.getDescription().trim());
        }

        // Use the authenticated account, not a username supplied by
        // the frontend, to identify who submitted the report.
        report.setUploadedBy(authentication.getName());
        report.setStatus("Pending");
        report.setId(null);
        report.setCreatedAt(null);

        ReportRecord savedReport = reportRepository.save(report);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }

    // Only ADMIN can view the reports table.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    // Only ADMIN can update report status.
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        var optionalReport = reportRepository.findById(id);

        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String status = body.get("status");

        if (status == null || !ALLOWED_STATUSES.contains(status)) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "message",
                    "Invalid status. Use Pending, Under Review, Approved, or Rejected."
                )
            );
        }

        ReportRecord report = optionalReport.get();
        report.setStatus(status);

        return ResponseEntity.ok(reportRepository.save(report));
    }
}
