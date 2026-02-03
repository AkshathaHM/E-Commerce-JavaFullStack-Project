package com.kodnest.app.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;  // ← ADD THIS IMPORT

@Entity
@Table(name = "productimages")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore   // ← THIS LINE PREVENTS INFINITE RECURSION
    private Product product;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    public ProductImage() {}

    public ProductImage(Product product, String imageUrl) {
        this.product = product;
        this.imageUrl = imageUrl;
    }

    // Getters & Setters (keep as-is)
    public Integer getImageId() { return imageId; }
    public void setImageId(Integer imageId) { this.imageId = imageId; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}