package com.kodnest.app.usersrepositaries;

import com.kodnest.app.entities.Cart_Items;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart_Items, Integer> {

    @Query("SELECT c FROM Cart_Items c " +
           "WHERE c.user.userId = :userId AND c.product.productId = :productId")
    Optional<Cart_Items> findByUserAndProduct(
            @Param("userId") int userId,
            @Param("productId") int productId
    );

    @Query("SELECT c FROM Cart_Items c " +
           "JOIN FETCH c.product p " +
           "LEFT JOIN FETCH p.productImages pi " +
           "WHERE c.user.userId = :userId")
    List<Cart_Items> findCartItemsWithProductDetails(@Param("userId") int userId);

    @Modifying
    @Query("UPDATE Cart_Items c SET c.quantity = :quantity WHERE c.id = :cartitemId")
    void updateCartitemQuantity(@Param("cartitemId") int cartitemId, @Param("quantity") int quantity);

    @Modifying
    @Transactional
    @Query("DELETE FROM Cart_Items c WHERE c.user.userId = :userId AND c.product.productId = :productId")
    void deleteCartItem(@Param("userId") int userId, @Param("productId") int productId);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM Cart_Items c WHERE c.user.userId = :userId")
    int countTotalItems(@Param("userId") int userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Cart_Items c WHERE c.user.userId = :userId")
    void deleteAllByUserUserId(@Param("userId") int userId);
}