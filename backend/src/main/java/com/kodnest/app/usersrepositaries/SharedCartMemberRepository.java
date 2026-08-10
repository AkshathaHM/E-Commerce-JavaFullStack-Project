package com.kodnest.app.usersrepositaries;

import com.kodnest.app.entities.SharedCartMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SharedCartMemberRepository extends JpaRepository<SharedCartMember, Integer> {
    Optional<SharedCartMember> findBySharedCart_IdAndUser_UserId(Integer sharedCartId, Integer userId);
}
