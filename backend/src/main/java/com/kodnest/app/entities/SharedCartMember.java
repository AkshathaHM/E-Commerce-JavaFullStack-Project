package com.kodnest.app.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "shared_cart_members")
public class SharedCartMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "shared_cart_id", nullable = false)
    private SharedCart sharedCart;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_owner", nullable = false)
    private boolean owner = false;

    public SharedCartMember() {
    }

    public SharedCartMember(SharedCart sharedCart, User user, boolean owner) {
        this.sharedCart = sharedCart;
        this.user = user;
        this.owner = owner;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public SharedCart getSharedCart() {
        return sharedCart;
    }

    public void setSharedCart(SharedCart sharedCart) {
        this.sharedCart = sharedCart;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isOwner() {
        return owner;
    }

    public void setOwner(boolean owner) {
        this.owner = owner;
    }
}
