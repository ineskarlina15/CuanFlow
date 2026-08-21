package com.example.finance_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.example.finance_service.entity.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    List<Attachment> findByTransactionId(Integer transactionId);

    @Modifying
    @Transactional
    void deleteByTransactionId(Integer transactionId);
}
