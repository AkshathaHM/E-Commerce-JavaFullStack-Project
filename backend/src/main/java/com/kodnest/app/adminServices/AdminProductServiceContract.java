package com.kodnest.app.adminServices;

import com.kodnest.app.entities.Product;

public interface AdminProductServiceContract {
	public Product addProductWithImage(String name, String description, Double price, Integer stock, Integer categoryId, String imageUrl);
	public void deleteProduct(Integer productId);
}
