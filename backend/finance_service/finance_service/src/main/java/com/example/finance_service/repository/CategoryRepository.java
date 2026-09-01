package com.example.finance_service.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.finance_service.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    @Query("SELECT c FROM Category c WHERE c.userId = :userId AND c.deletedAt IS NULL")
    List<Category> findAllActiveCategoriesByUserId(@org.springframework.data.repository.query.Param("userId") Integer userId);

    java.util.Optional<Category> findByIdAndUserId(Integer id, Integer userId);

    boolean existsByName(String name);

    boolean existsByNameAndUserId(String name, Integer userId);

    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.deletedAt = CURRENT_TIMESTAMP WHERE c.id = :id AND c.userId = :userId")
    void softDeleteByIdAndUserId(@org.springframework.data.repository.query.Param("id") Integer id, @org.springframework.data.repository.query.Param("userId") Integer userId);
}
