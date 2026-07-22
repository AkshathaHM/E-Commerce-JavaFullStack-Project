package com.kodnest.app.usercontrollers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kodnest.app.entities.User;
import com.kodnest.app.userservices.CartServiceContract;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(allowedOriginPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("api/cart")
public class CartController {
       
   CartServiceContract cartService;
   
   public CartController(CartServiceContract cartService) {
	super();
	this.cartService = cartService;
}

   @PostMapping("/add")
   @CrossOrigin(allowedOriginPatterns = "*", allowedHeaders = "*", allowCredentials = "true" )
   public ResponseEntity<Void>addToCart(@RequestBody Map<String, Object> request, HttpServletRequest req) {
	  
	User user =  (User) req.getAttribute("authenticatedUser");
	String username = (String) request.get("username");
	int productId = (int) request.get("productId");
	
	int quantity = request.containsKey("quantity") ? (int) request.get("quantity") : 1;
	
	cartService.addToCart(user, productId, quantity);
	return ResponseEntity.status(HttpStatus.CREATED).build();
	
   }
   @GetMapping("/items")
   public ResponseEntity<Map<String,Object>> getCartItems(HttpServletRequest request){
	    User user=(User) request.getAttribute("authenticatedUser");
	   //Call the service to cart items for the user
	   Map<String,Object> response=cartService.getCartItems(user);
	   return ResponseEntity.ok(response);
	   }
   
   @PutMapping("/update")
   public ResponseEntity<Void> updateCartItemQuantity(@RequestBody Map<String, Object> request, HttpServletRequest req) {
       String username = (String) request.get("username");
       int productId = (int) request.get("productId");
       int quantity = (int) request.get("quantity");

       // Fetch the user using username
       User user = (User) req.getAttribute("authenticatedUser");

       // Update the cart item quantity
       cartService.updateCartItemQuantity(user, productId, quantity);
       return ResponseEntity.ok().build();
   }
   @DeleteMapping("/delete")
   public ResponseEntity<Void> deleteCartItem(@RequestBody Map<String, Object> request, HttpServletRequest req) {
       String username = (String) request.get("username");
       int productId = (int) request.get("productId");

       // Fetch the user using username
       User user = (User)req.getAttribute("authenticatedUser");
       // Delete the cart item
       cartService.deleteCartItem(user.getUserId(), productId);
       return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
   }
   
   @GetMapping("items/count")
   public ResponseEntity<Integer> getCartItemCount(@RequestParam String username, HttpServletRequest req) {
	   User user = (User) req.getAttribute("authenticatedUser");
	   int cartCount = cartService.getCartItemCount(user.getUserId());
	   return ResponseEntity.ok(cartCount);
   }
}
