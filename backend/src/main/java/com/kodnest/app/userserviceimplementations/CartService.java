package com.kodnest.app.userserviceimplementations;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kodnest.app.entities.Cart_Items;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.CartServiceContract;
import com.kodnest.app.usersrepositaries.CartRepository;
import com.kodnest.app.usersrepositaries.ProductImageRepository;
import com.kodnest.app.usersrepositaries.ProductRepository;
import com.kodnest.app.usersrepositaries.UserRepository;

@Service
public class CartService implements CartServiceContract {

    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    public CartService(
            ProductRepository productRepository,
            CartRepository cartRepository,
            ProductImageRepository productImageRepository,
            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void addToCart(User user, int productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        Optional<Cart_Items> existingItem = cartRepository.findByUserAndProduct(user.getUserId(), productId);

        if (existingItem.isPresent()) {
            Cart_Items cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartRepository.save(cartItem);
        } else {
            Cart_Items newItem = new Cart_Items(user, product, quantity);
            cartRepository.save(newItem);
        }
    }

    @Override
    public Map<String, Object> getCartItems(User authenticatedUser) {
        List<Cart_Items> cartItems = cartRepository.findCartItemsWithProductDetails(authenticatedUser.getUserId());

        Map<String, Object> response = new HashMap<>();
        response.put("username", authenticatedUser.getUsername());
        response.put("role", authenticatedUser.getRole().toString());

        List<Map<String, Object>> products = new ArrayList<>();
        BigDecimal overallTotal = BigDecimal.ZERO;

        for (Cart_Items cartItem : cartItems) {
            Map<String, Object> productDetails = new HashMap<>();
            Product product = cartItem.getProduct();

            List<ProductImage> productImages = productImageRepository.findByProduct_ProductId(product.getProductId());
            String imageUrl = (productImages != null && !productImages.isEmpty())
                    ? productImages.get(0).getImageUrl()
                    : "default-url";

            BigDecimal itemTotal = BigDecimal.valueOf(cartItem.getQuantity()).multiply(product.getPrice());

            productDetails.put("product_id", product.getProductId());
            productDetails.put("image_url", imageUrl);
            productDetails.put("name", product.getName());
            productDetails.put("description", product.getDescription());
            productDetails.put("price_per_unit", product.getPrice());
            productDetails.put("quantity", cartItem.getQuantity());
            productDetails.put("total_price", itemTotal);

            products.add(productDetails);

            overallTotal = overallTotal.add(itemTotal);
        }

        Map<String, Object> cart = new HashMap<>();
        cart.put("products", products);
        cart.put("overall_total_price", overallTotal);

        response.put("cart", cart);
        return response;
    }

    @Override
    public void updateCartItemQuantity(User authenticatedUser, int productId, int quantity) {
        // We can skip redundant user fetch since authenticatedUser is already validated
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Optional<Cart_Items> existingItem = cartRepository.findByUserAndProduct(
                authenticatedUser.getUserId(), productId);

        if (existingItem.isPresent()) {
            Cart_Items cartItem = existingItem.get();
            if (quantity <= 0) {
                deleteCartItem(authenticatedUser.getUserId(), productId);
            } else {
                cartItem.setQuantity(quantity);
                cartRepository.save(cartItem);
            }
        } else {
            throw new RuntimeException("Cart item not found for user and product");
        }
    }

    @Override
    public void deleteCartItem(int userId, int productId) {
        // Optional: verify product exists (already done in most flows, but kept for safety)
        productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        cartRepository.deleteCartItem(userId, productId);
    }

    @Override
    public int getCartItemCount(int userId) {
        return cartRepository.countTotalItems(userId);
    }
}