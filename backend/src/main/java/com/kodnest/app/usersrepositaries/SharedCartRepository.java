package com.kodnest.app.usersrepositaries;

import com.kodnest.app.entities.SharedCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SharedCartRepository extends JpaRepository<SharedCart, Integer> {
    Optional<SharedCart> findByShareId(String shareId);
}
