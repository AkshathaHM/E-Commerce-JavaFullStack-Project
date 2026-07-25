package com.kodnest.app.adminControllers;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kodnest.app.adminServices.AdminProductServiceContract;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductAddRequestDto;
import com.kodnest.app.entities.ProductDeleteRequestDto;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.entities.ProductResponseDto;
import com.kodnest.app.entities.ProductUpdateRequestDto;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/admin/products")
public class AdminProductController {

    private final AdminProductServiceContract adminProductService;

    public AdminProductController(AdminProductServiceContract adminProductService) {
        this.adminProductService = adminProductService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@Valid @RequestBody ProductAddRequestDto productRequest) {
        try {
            Product addedProduct = adminProductService.addProductWithImage(
                    productRequest.getName().trim(),
                    productRequest.getDescription(),
                    productRequest.getPrice(),
                    productRequest.getStock(),
                    productRequest.getCategoryId(),
                    productRequest.getImageUrl()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(productToDto(addedProduct));

        } catch ( IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add product: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteProduct(@RequestBody ProductDeleteRequestDto requestBody) {
        try {
            Integer productId = requestBody.getProductId();
            if (productId == null) {
                return ResponseEntity.badRequest().body("productId is required");
            }

            adminProductService.deleteProduct(productId);
            return ResponseEntity.ok("Product deleted successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete product: " + e.getMessage());
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteProductPost(@RequestBody ProductDeleteRequestDto requestBody) {
        return deleteProduct(requestBody);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProduct(@Valid @RequestBody ProductUpdateRequestDto requestBody) {
        try {
            Integer productId = requestBody.getProductId();

            Product updatedProduct = adminProductService.updateProduct(productId,
                    requestBody.getName(),
                    requestBody.getDescription(),
                    requestBody.getPrice(),
                    requestBody.getStock(),
                    requestBody.getCategoryId(),
                    requestBody.getImageUrl());
            return ResponseEntity.ok(productToDto(updatedProduct));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update product: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductResponseDto> products = adminProductService.getAllProducts().stream()
                    .map(this::productToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch products: " + e.getMessage());
        }
    }

    // Your helper methods (keep as-is)
    private ProductResponseDto productToDto(Product product) {
        return new ProductResponseDto(
                product.getProductId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCategory() != null ? product.getCategory().getCategoryName() : null,
                product.getProductImages() == null ? List.of() : product.getProductImages().stream()
                        .map(ProductImage::getImageUrl)
                        .collect(Collectors.toList())
        );
    }

    private String getRequiredString(String value, String key) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return value.trim();
    }
}