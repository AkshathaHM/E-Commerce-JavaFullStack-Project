package com.kodnest.app.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shared_carts")
public class SharedCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "share_id", nullable = false, unique = true)
    private String shareId;

    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "sharedCart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SharedCartItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "sharedCart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SharedCartMember> members = new ArrayList<>();

    public SharedCart() {
    }

    public SharedCart(String shareId, String title, User owner) {
        this.shareId = shareId;
        this.title = title;
        this.owner = owner;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getShareId() {
        return shareId;
    }

    public void setShareId(String shareId) {
        this.shareId = shareId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<SharedCartItem> getItems() {
        return items;
    }

    public void setItems(List<SharedCartItem> items) {
        this.items = items;
    }

    public List<SharedCartMember> getMembers() {
        return members;
    }

    public void setMembers(List<SharedCartMember> members) {
        this.members = members;
    }

    public void addItem(SharedCartItem item) {
        items.add(item);
        item.setSharedCart(this);
    }

    public void addMember(SharedCartMember member) {
        members.add(member);
        member.setSharedCart(this);
    }
}
