package com.kodnest.app.userserviceimplementations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;          // ← added (most likely missing import)
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.OrderServiceContract;
import com.kodnest.app.usersrepositaries.OrderItemRepository;
import com.kodnest.app.usersrepositaries.ProductImageRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;

@Service
public class OrderService implements OrderServiceContract {

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;          // ← fixed name (was productItemRepository)
    private final ProductImageRepository productImageRepository;

    public OrderService(
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository) {
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @Override
    public Map<String, Object> getOrdersForUser(User user) {
        // Assuming this method exists in your repository (from earlier @Query)
        List<OrderItem> orderItems = orderItemRepository.findSuccessfulOrderItemsByUserId(user.getUserId());

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        List<Map<String, Object>> products = new ArrayList<>();

        for (OrderItem item : orderItems) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) {
                continue; // Skip if the product does not exist
            }

            // Fetch the product image (if available)
            List<ProductImage> images = productImageRepository.findByProduct_ProductId(product.getProductId());

            String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

            // Create a product details map
            Map<String, Object> productDetails = new HashMap<>();
            productDetails.put("order_id", item.getOrder().getOrderId());
            productDetails.put("quantity", item.getQuantity());
            productDetails.put("total_price", item.getTotalPrice());
            productDetails.put("image_url", imageUrl);
            productDetails.put("product_id", product.getProductId());
            productDetails.put("name", product.getName());
            productDetails.put("description", product.getDescription());
            productDetails.put("price_per_unit", item.getPricePerUnit());

            products.add(productDetails);
        }

        response.put("products", products);
        return response;
    }
}