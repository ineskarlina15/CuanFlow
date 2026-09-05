package com.example.auth_service.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.auth_service.entity.AuditLog;
import com.example.auth_service.repository.AuditLogRepository;
import com.example.auth_service.service.AuditLogService;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public AuditLog recordLog(Integer userId, String action, String module, String entity, String description, 
                              String ipAddress, String userAgent, String status, String severity) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action != null ? action : "ACTIVITY")
                .module(module != null ? module : "SYSTEM")
                .entity(entity)
                .description(description != null ? description : "")
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .userAgent(userAgent != null ? userAgent : "CuanFlow System")
                .status(status != null ? status : "SUCCESS")
                .severity(severity != null ? severity : "LOW")
                .createdAt(LocalDateTime.now())
                .build();
        return auditLogRepository.save(log);
    }
}
