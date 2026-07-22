package com.kodnest.app.adminServices;

import java.util.List;
import com.kodnest.app.entities.Product;

public interface AdminProductServiceContract {
	public Product addProductWithImage(String name, String description, Double price, Integer stock, Integer categoryId, String imageUrl);
	public void deleteProduct(Integer productId);
	public Product updateProduct(Integer productId, String name, String description, Double price, Integer stock, Integer categoryId, String imageUrl);
	public List<Product> getAllProducts();
}
