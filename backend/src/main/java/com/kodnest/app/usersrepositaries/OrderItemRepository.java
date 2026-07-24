package com.kodnest.app.usersrepositaries;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import com.kodnest.app.entities.OrderItem;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
	// Find all order items for a given order id (service calls findByOrderId(...))
	@Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.order o WHERE o.orderId = :orderId")
	List<OrderItem> findByOrderId(@Param("orderId") String orderId);

	// Delete all order items for a given product id
	@Modifying
	@Transactional
	void deleteAllByProductId(Integer productId);

	@Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.order o WHERE o.userId = :userId")
	Page<OrderItem> findOrderItemsByUserId(@Param("userId") Integer userId, Pageable pageable);

}