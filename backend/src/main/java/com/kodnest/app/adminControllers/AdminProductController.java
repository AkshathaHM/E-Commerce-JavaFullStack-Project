package com.kodnest.app.adminControllers;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kodnest.app.adminServices.AdminProductServiceContract;
import com.kodnest.app.entities.Product;

@RestController
@CrossOrigin(allowedOriginPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/admin/products")
public class AdminProductController {

    private final AdminProductServiceContract adminProductService;

    public AdminProductController(AdminProductServiceContract adminProductService) {
        this.adminProductService = adminProductService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> productRequest) {
        try {
            String name = getRequiredString(productRequest, "name");
            String description = (String) productRequest.get("description");

            Double price = getRequiredDouble(productRequest, "price");
            if (price <= 0) return ResponseEntity.badRequest().body("Price must be positive");

            Integer stock = getRequiredInteger(productRequest, "stock");
            if (stock < 0) return ResponseEntity.badRequest().body("Stock cannot be negative");

            Integer categoryId = getRequiredInteger(productRequest, "categoryId");

            String imageUrl = (String) productRequest.get("imageUrl");

            Product addedProduct = adminProductService.addProductWithImage(
                    name, description, price, stock, categoryId, imageUrl
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(addedProduct);

        } catch ( IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add product: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    @CrossOrigin(allowedOriginPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
    public ResponseEntity<?> deleteProduct(@RequestBody Map<String, Integer> requestBody) {
        try {
            Integer productId = requestBody.get("productId");
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

    // Your helper methods (keep as-is)
    private String getRequiredString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null || String.valueOf(val).trim().isEmpty()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return String.valueOf(val).trim();
    }

    private Double getRequiredDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) throw new IllegalArgumentException(key + " is required");
        try {
            return Double.parseDouble(String.valueOf(val));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid " + key + " format");
        }
    }

    private Integer getRequiredInteger(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) throw new IllegalArgumentException(key + " is required");
        try {
            return Integer.parseInt(String.valueOf(val));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid " + key + " format");
        }
    }
}