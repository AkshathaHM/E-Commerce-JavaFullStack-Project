package com.kodnest.app.adminServiceImplementations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.kodnest.app.adminServices.AdminProductServiceContract;
import com.kodnest.app.entities.Category;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.usersrepositaries.CategoryRepository;
import com.kodnest.app.usersrepositaries.CartRepository;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;

@Service
public class AdminProductService implements AdminProductServiceContract {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartRepository cartRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminProductService(ProductRepository productRepository, 
                              CategoryRepository categoryRepository,
                              CartRepository cartRepository,
                              OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cartRepository = cartRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public Product addProductWithImage(String name, String description, Double price, Integer stock,
                                      Integer categoryId, String imageUrl) {

        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid category ID");
        }

        Product product = new Product();
        product.setName(name);
        product.setDescription(description != null ? description : "");
        product.setPrice(BigDecimal.valueOf(price));
        product.setStock(stock);
        product.setCategory(categoryOpt.get());
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // Add image if provided – using helper method (links both sides)
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            ProductImage image = new ProductImage();
            image.setImageUrl(imageUrl);
            product.addImage(image);  // ← this is key
        }

        // Single save – cascade saves image automatically
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Product not found");
        }
        
        // First delete all cart items for this product (to avoid foreign key constraint violation)
        cartRepository.deleteAllByProductId(productId);
        
        // Then delete all order items for this product (to avoid foreign key constraint violation)
        orderItemRepository.deleteAllByProductId(productId);
        
        // Finally delete the product (orphanRemoval handles images)
        productRepository.deleteById(productId);
    }
}