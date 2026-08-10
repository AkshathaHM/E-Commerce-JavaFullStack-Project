package com.kodnest.app.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "shared_cart_items")
public class SharedCartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "shared_cart_id", nullable = false)
    private SharedCart sharedCart;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    public SharedCartItem() {
    }

    public SharedCartItem(SharedCart sharedCart, Product product, Integer quantity) {
        this.sharedCart = sharedCart;
        this.product = product;
        this.quantity = quantity;
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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
