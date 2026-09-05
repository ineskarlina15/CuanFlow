package com.example.auth_service.service;

import java.util.List;
import com.example.auth_service.entity.AuditLog;

public interface AuditLogService {
    List<AuditLog> getAllAuditLogs();
    AuditLog recordLog(Integer userId, String action, String module, String entity, String description, String ipAddress, String userAgent, String status, String severity);
    byte[] exportAuditLogsToExcel();
    byte[] exportAuditLogsToPdf();
}
