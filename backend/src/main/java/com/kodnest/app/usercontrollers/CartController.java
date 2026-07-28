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
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project.vercel.app", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true")
@RequestMapping("/api/cart")
public class CartController {
       
   CartServiceContract cartService;
   private final com.kodnest.app.usersrepositaries.UserRepository userRepository;
   
   public CartController(CartServiceContract cartService, com.kodnest.app.usersrepositaries.UserRepository userRepository) {
 	super();
 	this.cartService = cartService;
 	this.userRepository = userRepository;
 }

   @PostMapping("/add")
   @CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "https://e-commerce-java-full-stack-project-five.vercel.app", "https://e-commerce-java-full-stack-project-seven.vercel.app", "https://e-commerce-javafullstack-project-2.onrender.com"}, allowCredentials = "true" )
      public ResponseEntity<Void>addToCart(@RequestBody Map<String, Object> request, HttpServletRequest req) {

      User user =  (User) req.getAttribute("authenticatedUser");
      String username = request.containsKey("username") && request.get("username") != null ? String.valueOf(request.get("username")).trim() : null;

      // resolve user if not authenticated (fallback to username)
      if (user == null && username != null && !username.isBlank() && !"Guest".equalsIgnoreCase(username)) {
         user = userRepository.findByUsername(username).orElse(null);
      }

      if (user == null) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }

      // parse productId safely
      Object pidObj = request.get("productId");
      int productId;
      try {
         if (pidObj == null) throw new IllegalArgumentException("productId is required");
         productId = Integer.parseInt(String.valueOf(pidObj));
      } catch (NumberFormatException ex) {
         throw new IllegalArgumentException("Invalid productId: " + pidObj);
      }

      int quantity = 1;
      if (request.containsKey("quantity") && request.get("quantity") != null) {
         try { quantity = Integer.parseInt(String.valueOf(request.get("quantity"))); } catch (NumberFormatException ignored) {}
      }

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
         String username = request.containsKey("username") && request.get("username") != null ? String.valueOf(request.get("username")) : null;

         Object pidObj = request.get("productId");
         Object qtyObj = request.get("quantity");

         if (pidObj == null || qtyObj == null) return ResponseEntity.badRequest().build();

         int productId;
         int quantity;
         try {
            productId = Integer.parseInt(String.valueOf(pidObj));
            quantity = Integer.parseInt(String.valueOf(qtyObj));
         } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().build();
         }

         User user = (User) req.getAttribute("authenticatedUser");
         if (user == null && username != null && !"Guest".equalsIgnoreCase(username)) {
            user = userRepository.findByUsername(username).orElse(null);
         }
         if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

         cartService.updateCartItemQuantity(user, productId, quantity);
         return ResponseEntity.ok().build();
      }
   @DeleteMapping("/delete")
      public ResponseEntity<Void> deleteCartItem(@RequestBody Map<String, Object> request, HttpServletRequest req) {
         String username = request.containsKey("username") && request.get("username") != null ? String.valueOf(request.get("username")) : null;
         Object pidObj = request.get("productId");
         if (pidObj == null) return ResponseEntity.badRequest().build();

         int productId;
         try { productId = Integer.parseInt(String.valueOf(pidObj)); } catch (NumberFormatException ex) { return ResponseEntity.badRequest().build(); }

         User user = (User)req.getAttribute("authenticatedUser");
         if (user == null && username != null && !"Guest".equalsIgnoreCase(username)) {
            user = userRepository.findByUsername(username).orElse(null);
         }
         if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

         cartService.deleteCartItem(user.getUserId(), productId);
         return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
      }
   
   @GetMapping("items/count")
   public ResponseEntity<Integer> getCartItemCount(@RequestParam String username, HttpServletRequest req) {
    	User user = (User) req.getAttribute("authenticatedUser");
    	if (user == null && username != null && !username.isBlank() && !"Guest".equalsIgnoreCase(username)) {
    		user = userRepository.findByUsername(username).orElse(null);
    	}
    	if (user == null) return ResponseEntity.ok(0);
    	int cartCount = cartService.getCartItemCount(user.getUserId());
    	return ResponseEntity.ok(cartCount);
   }
}
