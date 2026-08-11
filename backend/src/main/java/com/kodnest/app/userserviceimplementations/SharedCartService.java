package com.kodnest.app.userserviceimplementations;

import com.kodnest.app.entities.*;
import com.kodnest.app.userservices.SharedCartServiceContract;
import com.kodnest.app.usersrepositaries.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SharedCartService implements SharedCartServiceContract {

    private final SharedCartRepository sharedCartRepository;
    private final SharedCartItemRepository sharedCartItemRepository;
    private final SharedCartMemberRepository sharedCartMemberRepository;
    private final com.kodnest.app.usersrepositaries.SharedCartInviteRepository sharedCartInviteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public SharedCartService(
            SharedCartRepository sharedCartRepository,
            SharedCartItemRepository sharedCartItemRepository,
            SharedCartMemberRepository sharedCartMemberRepository,
            com.kodnest.app.usersrepositaries.SharedCartInviteRepository sharedCartInviteRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.sharedCartRepository = sharedCartRepository;
        this.sharedCartItemRepository = sharedCartItemRepository;
        this.sharedCartMemberRepository = sharedCartMemberRepository;
        this.sharedCartInviteRepository = sharedCartInviteRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SharedCart createSharedCart(User owner, String title, List<Map<String, Object>> items) {
        String shareId = generateShareId();
        SharedCart sharedCart = new SharedCart(shareId, title != null && !title.isBlank() ? title : "Shared Cart", owner);
        SharedCartMember ownerMember = new SharedCartMember(sharedCart, owner, true);
        sharedCart.getMembers().add(ownerMember);

        if (items != null) {
            for (Map<String, Object> itemRequest : items) {
                if (itemRequest == null) {
                    continue;
                }
                Object pidObj = itemRequest.get("productId");
                Object qtyObj = itemRequest.get("quantity");
                if (pidObj == null || qtyObj == null) {
                    continue;
                }
                int productId;
                int quantity;
                try {
                    productId = Integer.parseInt(String.valueOf(pidObj));
                    quantity = Integer.parseInt(String.valueOf(qtyObj));
                } catch (NumberFormatException e) {
                    continue;
                }
                if (quantity < 1) {
                    continue;
                }
                Product product = productRepository.findById(productId).orElse(null);
                if (product == null) {
                    continue;
                }
                SharedCartItem sharedItem = new SharedCartItem(sharedCart, product, quantity);
                sharedCart.getItems().add(sharedItem);
            }
        }

        return sharedCartRepository.save(sharedCart);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSharedCartDetails(User viewer, String shareId) {
        SharedCart sharedCart = sharedCartRepository.findByShareId(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Shared cart not found"));

        // If viewer is null (unauthenticated), allow a public preview of the shared cart
        if (viewer == null) {
            return buildSharedCartResponse(sharedCart);
        }

        boolean isMember = sharedCartMemberRepository.findBySharedCart_IdAndUser_UserId(sharedCart.getId(), viewer.getUserId()).isPresent();
        if (!isMember) {
            throw new SecurityException("Not authorized to view this shared cart");
        }

        return buildSharedCartResponse(sharedCart);
    }

    @Override
    @Transactional
    public SharedCart joinSharedCart(User user, String shareId) {
        SharedCart sharedCart = sharedCartRepository.findByShareId(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Shared cart not found"));

        boolean alreadyMember = sharedCartMemberRepository.findBySharedCart_IdAndUser_UserId(sharedCart.getId(), user.getUserId()).isPresent();
        if (!alreadyMember) {
            // allow join only if an invite exists for this user's email
            String email = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : null;
            boolean hasInvite = false;
            if (email != null) {
                hasInvite = sharedCartInviteRepository.findBySharedCart_IdAndEmail(sharedCart.getId(), email).isPresent();
            }
            if (!hasInvite) {
                throw new SecurityException("You are not invited to join this shared cart");
            }

            SharedCartMember member = new SharedCartMember(sharedCart, user, false);
            sharedCart.getMembers().add(member);
            sharedCartRepository.save(sharedCart);
        }

        return sharedCart;
    }

    @Override
    @Transactional
    public void addOrUpdateSharedCartItem(User user, String shareId, int productId, int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        SharedCart sharedCart = sharedCartRepository.findByShareId(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Shared cart not found"));

        boolean isMember = sharedCartMemberRepository.findBySharedCart_IdAndUser_UserId(sharedCart.getId(), user.getUserId()).isPresent();
        if (!isMember) {
            throw new SecurityException("Not authorized to edit this shared cart");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        SharedCartItem sharedItem = sharedCartItemRepository
                .findBySharedCart_IdAndProduct_ProductId(sharedCart.getId(), productId)
                .orElse(null);

        if (sharedItem == null) {
            sharedItem = new SharedCartItem(sharedCart, product, quantity);
            sharedCart.getItems().add(sharedItem);
        } else {
            sharedItem.setQuantity(quantity);
        }

        sharedCart.setUpdatedAt(LocalDateTime.now());
        sharedCartRepository.save(sharedCart);
    }

    @Override
    @Transactional
    public void removeSharedCartItem(User user, String shareId, int productId) {
        SharedCart sharedCart = sharedCartRepository.findByShareId(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Shared cart not found"));

        boolean isMember = sharedCartMemberRepository.findBySharedCart_IdAndUser_UserId(sharedCart.getId(), user.getUserId()).isPresent();
        if (!isMember) {
            throw new SecurityException("Not authorized to edit this shared cart");
        }

        SharedCartItem sharedItem = sharedCartItemRepository
                .findBySharedCart_IdAndProduct_ProductId(sharedCart.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found in shared cart"));

        sharedCart.getItems().remove(sharedItem);
        sharedCartItemRepository.delete(sharedItem);
        sharedCart.setUpdatedAt(LocalDateTime.now());
        sharedCartRepository.save(sharedCart);
    }

    private Map<String, Object> buildSharedCartResponse(SharedCart sharedCart) {
        Map<String, Object> response = new HashMap<>();
        response.put("shareId", sharedCart.getShareId());
        response.put("title", sharedCart.getTitle());
        response.put("owner", Map.of(
                "userId", sharedCart.getOwner().getUserId(),
                "username", sharedCart.getOwner().getUsername(),
                "name", sharedCart.getOwner().getName()
        ));

        List<Map<String, Object>> members = new ArrayList<>();
        for (SharedCartMember member : sharedCart.getMembers()) {
            members.add(Map.of(
                    "userId", member.getUser().getUserId(),
                    "username", member.getUser().getUsername(),
                    "name", member.getUser().getName(),
                    "owner", member.isOwner()
            ));
        }
        response.put("members", members);

        List<Map<String, Object>> items = new ArrayList<>();
        BigDecimal overallTotal = BigDecimal.ZERO;
        for (SharedCartItem item : sharedCart.getItems()) {
            Product product = item.getProduct();
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            items.add(Map.of(
                    "product_id", product.getProductId(),
                    "name", product.getName(),
                    "description", product.getDescription(),
                    "price_per_unit", product.getPrice(),
                    "quantity", item.getQuantity(),
                    "total_price", itemTotal,
                    "stock", product.getStock()
            ));
            overallTotal = overallTotal.add(itemTotal);
        }
        response.put("items", items);
        response.put("overall_total_price", overallTotal);
        response.put("updated_at", sharedCart.getUpdatedAt().toString());
        return response;
    }

    private String generateShareId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
