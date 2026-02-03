package com.kodnest.app.usersrepositaries;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kodnest.app.entities.JWToken;

import jakarta.transaction.Transactional;

@Repository
public interface JWTokenRepository extends JpaRepository<JWToken, Integer> {

    // Custom query to find tokens by user ID
    @Query("SELECT t FROM JWToken t WHERE t.user.userId = :userId")
    JWToken findByUserId(@Param("userId") int userId);
     
    Optional<JWToken> findByToken(String token);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM JWToken t WHERE t.user.userId = :userId")
    void deleteByUserId(@Param("userId") int userId);
}