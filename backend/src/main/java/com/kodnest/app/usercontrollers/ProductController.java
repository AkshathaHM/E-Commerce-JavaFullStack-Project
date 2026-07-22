package com.kodnest.app.usercontrollers;

import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.User;
import com.kodnest.app.userserviceimplementations.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(
    origins = {
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173",
        "https://e-commerce-java-full-stack-project-five.vercel.app",
        "https://e-commerce-java-full-stack-project-seven.vercel.app",
        "https://e-commerce-javafullstack-project-2.onrender.com"
    },
    allowCredentials = "true"
)
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String category,
            HttpServletRequest request) {
        try {
            User authenticatedUser = (User) request.getAttribute("authenticatedUser");
            List<Product> products = productService.getProductsByCategory(category == null || category.isBlank() ? "" : category);

            Map<String, Object> response = new HashMap<>();
            if (authenticatedUser != null) {
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("name", authenticatedUser.getUsername());
                userInfo.put("role", authenticatedUser.getRole().name());
                response.put("user", userInfo);
            } else {
                response.put("user", Map.of("name", "Guest", "role", "GUEST"));
            }

            List<Map<String, Object>> productList = new ArrayList<>();
            for (Product product : products) {
                Map<String, Object> productDetails = new HashMap<>();
                productDetails.put("product_id", product.getProductId());
                productDetails.put("name", product.getName());
                productDetails.put("description", product.getDescription());
                productDetails.put("price", product.getPrice());
                productDetails.put("stock", product.getStock());
                List<String> images = product.getProductImages() == null ? List.of() : product.getProductImages().stream()
                        .filter(Objects::nonNull)
                        .map(image -> image.getImageUrl())
                        .collect(Collectors.toList());
                productDetails.put("images", images);
                productList.add(productDetails);
            }

            response.put("products", productList);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}