package com.example.auth_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.entity.AuditLog;
import com.example.auth_service.service.AuditLogService;
import com.example.auth_service.utility.Message;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/audit-logs")
@PreAuthorize("hasAuthority('ADMIN')")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private Message message;

    @GetMapping
    public ResponseEntity<?> getAllAuditLogs() {
        try {
            List<AuditLog> logs = auditLogService.getAllAuditLogs();
            return message.getData("Berhasil mengambil rekam jejak audit sistem (Audit Trail)", logs, 200);
        } catch (Exception e) {
            return message.error("Gagal memuat log audit: " + e.getMessage(), 500);
        }
    }

    @PostMapping
    public ResponseEntity<?> createAuditLog(@RequestBody AuditLog logReq, HttpServletRequest request) {
        try {
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isBlank()) {
                ip = request.getRemoteAddr();
            }
            String ua = request.getHeader("User-Agent");

            AuditLog saved = auditLogService.recordLog(
                    logReq.getUserId(),
                    logReq.getAction(),
                    logReq.getModule(),
                    logReq.getEntity(),
                    logReq.getDescription(),
                    ip,
                    ua,
                    logReq.getStatus(),
                    logReq.getSeverity()
            );
            return message.getData("Log audit berhasil dicatat", saved, 201);
        } catch (Exception e) {
            return message.badReq("Gagal mencatat log audit: " + e.getMessage(), 400);
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        try {
            byte[] data = auditLogService.exportAuditLogsToExcel();
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CuanFlow_Audit_Trail.xlsx")
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        try {
            byte[] data = auditLogService.exportAuditLogsToPdf();
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CuanFlow_Audit_Trail.pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
