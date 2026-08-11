package com.kodnest.app.usersrepositaries;

import com.kodnest.app.entities.SharedCartInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SharedCartInviteRepository extends JpaRepository<SharedCartInvite, Long> {
    Optional<SharedCartInvite> findBySharedCart_IdAndEmail(Integer sharedCartId, String email);
}
