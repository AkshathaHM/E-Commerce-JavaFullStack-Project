package com.kodnest.app.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shared_cart_invites")
public class SharedCartInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_cart_id")
    private SharedCart sharedCart;

    @Column(nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by")
    private User invitedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public SharedCartInvite() {}

    public SharedCartInvite(SharedCart sharedCart, String email, User invitedBy) {
        this.sharedCart = sharedCart;
        this.email = email != null ? email.trim().toLowerCase() : null;
        this.invitedBy = invitedBy;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public SharedCart getSharedCart() { return sharedCart; }
    public String getEmail() { return email; }
    public User getInvitedBy() { return invitedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
