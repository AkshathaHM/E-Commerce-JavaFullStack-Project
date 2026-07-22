package com.kodnest.app.adminControllers;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kodnest.app.adminServices.AdminProductServiceContract;
import com.kodnest.app.entities.Product;

@RestController
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
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

    @PostMapping("/delete")
    public ResponseEntity<?> deleteProductPost(@RequestBody Map<String, Integer> requestBody) {
        return deleteProduct(requestBody);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProduct(@RequestBody Map<String, Object> requestBody) {
        try {
            Integer productId = getRequiredInteger(requestBody, "productId");
            String name = (String) requestBody.get("name");
            String description = (String) requestBody.get("description");
            Double price = requestBody.containsKey("price") && requestBody.get("price") != null
                    ? getRequiredDouble(requestBody, "price")
                    : null;
            Integer stock = requestBody.containsKey("stock") && requestBody.get("stock") != null
                    ? getRequiredInteger(requestBody, "stock")
                    : null;
            Integer categoryId = requestBody.containsKey("categoryId") && requestBody.get("categoryId") != null
                    ? getRequiredInteger(requestBody, "categoryId")
                    : null;
            String imageUrl = (String) requestBody.get("imageUrl");

            Product updatedProduct = adminProductService.updateProduct(productId, name, description, price, stock, categoryId, imageUrl);
            return ResponseEntity.ok(updatedProduct);
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
            return ResponseEntity.ok(adminProductService.getAllProducts());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch products: " + e.getMessage());
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