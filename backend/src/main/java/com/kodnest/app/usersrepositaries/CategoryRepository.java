package com.kodnest.app.usersrepositaries;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kodnest.app.entities.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByCategoryName(String categoryName);
    Optional<Category> findByCategoryNameIgnoreCase(String categoryName);
}