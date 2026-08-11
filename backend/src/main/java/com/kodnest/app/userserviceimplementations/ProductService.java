package com.kodnest.app.userserviceimplementations;


import com.kodnest.app.entities.Category;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.usersrepositaries.CategoryRepository;
import com.kodnest.app.usersrepositaries.ProductImageRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getProductsByCategory(String categoryName) {
        if (categoryName != null && !categoryName.isEmpty()) {
            return productRepository.findByCategoryNameIgnoreCaseWithImages(categoryName.trim());
        } else {
            return productRepository.findAllWithImages();
        }
    }

    public List<Product> getProductsWithFilters(String categoryName, String colorsCsv, String sizesCsv,
                                                Double minPrice, Double maxPrice, Double minRating, String sort) {
        List<Product> products = getProductsByCategory(categoryName == null ? "" : categoryName);

        // filter by colors
        if (colorsCsv != null && !colorsCsv.isBlank()) {
            String[] colors = colorsCsv.split(",");
            products = products.stream().filter(p -> {
                if (p.getColor() == null) return false;
                String pc = p.getColor().toLowerCase();
                for (String c : colors) { if (pc.contains(c.trim().toLowerCase())) return true; }
                return false;
            }).toList();
        }

        // filter by sizes
        if (sizesCsv != null && !sizesCsv.isBlank()) {
            String[] sizes = sizesCsv.split(",");
            products = products.stream().filter(p -> {
                if (p.getSize() == null) return false;
                String ps = p.getSize().toLowerCase();
                for (String s : sizes) { if (ps.contains(s.trim().toLowerCase())) return true; }
                return false;
            }).toList();
        }

        // price range
        if (minPrice != null) {
            products = products.stream().filter(p -> p.getPrice() != null && p.getPrice().doubleValue() >= minPrice).toList();
        }
        if (maxPrice != null) {
            products = products.stream().filter(p -> p.getPrice() != null && p.getPrice().doubleValue() <= maxPrice).toList();
        }

        // rating
        if (minRating != null) {
            products = products.stream().filter(p -> p.getRating() != null && p.getRating() >= minRating).toList();
        }

        // sorting
        if (sort != null) {
            if (sort.equals("priceLow")) {
                products = products.stream().sorted((a, b) -> Double.compare(a.getPrice().doubleValue(), b.getPrice().doubleValue())).toList();
            } else if (sort.equals("priceHigh")) {
                products = products.stream().sorted((a, b) -> Double.compare(b.getPrice().doubleValue(), a.getPrice().doubleValue())).toList();
            }
        }

        return products;
    }

    public List<String> getProductImages(Integer productId) {
        List<ProductImage> productImages = productImageRepository.findByProduct_ProductId(productId);
        List<String> imageUrls = new ArrayList<>();
        for (ProductImage image : productImages) {
            imageUrls.add(image.getImageUrl());
        }
        return imageUrls;
    }
}