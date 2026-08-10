package com.kodnest.app.usersrepositaries;

import com.kodnest.app.entities.SharedCartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SharedCartItemRepository extends JpaRepository<SharedCartItem, Integer> {
    Optional<SharedCartItem> findBySharedCart_IdAndProduct_ProductId(Integer sharedCartId, Integer productId);
}
