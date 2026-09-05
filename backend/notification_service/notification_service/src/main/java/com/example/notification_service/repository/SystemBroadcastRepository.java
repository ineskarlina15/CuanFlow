package com.example.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.notification_service.entity.SystemBroadcast;

@Repository
public interface SystemBroadcastRepository extends JpaRepository<SystemBroadcast, Integer> {
    List<SystemBroadcast> findAllByOrderBySentAtDesc();
}
