package com.example.finance_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finance_service.entity.Category;
import com.example.finance_service.payload.req.CategoryReq;
import com.example.finance_service.service.CategoryService;
import com.example.finance_service.repository.CategoryRepository;

@Service
public class CategoryServiceImpl implements CategoryService{
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Category createCategory(Integer userId, CategoryReq request) throws Exception {
        Category category = new Category();
        category.setUserId(userId);
        category.setName(request.getName());
        category.setType(request.getType());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategories(Integer userId) {
        return categoryRepository.findAllActiveCategoriesByUserId(userId);
    }

    @Override
    public Category getCategoryById(Integer userId, Integer id) throws Exception {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new Exception("Kategori tidak ditemukan!"));
        
        if (category.getDeletedAt() != null) {
            throw new Exception("Kategori ini sudah dihapus!");
        }
        return category;
    }

    @Override
    public Category updateCategory(Integer userId, Integer id, CategoryReq request) throws Exception {
        Category category = getCategoryById(userId, id); 
        
        category.setName(request.getName());
        category.setType(request.getType());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Integer userId, Integer id) throws Exception {
        Category category = getCategoryById(userId, id); 
        categoryRepository.softDeleteByIdAndUserId(category.getId(), userId);
    }
}
