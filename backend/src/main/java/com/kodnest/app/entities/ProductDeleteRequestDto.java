package com.kodnest.app.entities;

public class ProductDeleteRequestDto {
    private Integer productId;

    public ProductDeleteRequestDto() {
    }

    public ProductDeleteRequestDto(Integer productId) {
        this.productId = productId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }
}
