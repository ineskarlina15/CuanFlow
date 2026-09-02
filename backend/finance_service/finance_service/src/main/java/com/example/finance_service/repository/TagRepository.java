package com.example.finance_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.finance_service.entity.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer> {
    List<Tag> findByUserId(Integer userId);
    Optional<Tag> findByIdAndUserId(Integer id, Integer userId);
    List<Tag> findByIdInAndUserId(List<Integer> ids, Integer userId);
}
