package com.example.finance_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finance_service.entity.Category;
import com.example.finance_service.entity.CategoryType;
import com.example.finance_service.payload.req.CategoryReq;
import com.example.finance_service.repository.CategoryRepository;
import com.example.finance_service.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {
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

    private void seedDefaultCategories(Integer userId) {
        Object[][] defaults = {
            {"Salary", CategoryType.INCOME, "Monthly salary"},
            {"Food & Beverage", CategoryType.EXPENSE, "Meals and dining"},
            {"Transport", CategoryType.EXPENSE, "Commute and gas"},
            {"Shopping", CategoryType.EXPENSE, "Clothing and goods"},
            {"Bills & Utilities", CategoryType.EXPENSE, "Water, electricity, internet"},
            {"Investment", CategoryType.INCOME, "Dividends and stock returns"},
            {"Others", CategoryType.EXPENSE, "Miscellaneous expenses"}
        };
        for (Object[] def : defaults) {
            try {
                String catName = (String) def[0];
                if (!categoryRepository.existsByNameAndUserId(catName, userId)) {
                    Category c = new Category();
                    c.setUserId(userId);
                    c.setName(catName);
                    c.setType((CategoryType) def[1]);
                    c.setDescription((String) def[2]);
                    categoryRepository.save(c);
                }
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public List<Category> getAllCategories(Integer userId) {
        if (userId == null) {
            userId = 1;
        }
        List<Category> categories = categoryRepository.findAllActiveCategoriesByUserId(userId);
        // Jangan pernah me-return categoryRepository.findAll() karena akan mencampur kategori user lain
        return categories;
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
