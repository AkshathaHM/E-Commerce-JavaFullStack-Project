-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: salessavy
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jwt_tokens`
--

DROP TABLE IF EXISTS `jwt_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jwt_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`token_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `jwt_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_tokens`
--

LOCK TABLES `jwt_tokens` WRITE;
/*!40000 ALTER TABLE `jwt_tokens` DISABLE KEYS */;
INSERT INTO `jwt_tokens` VALUES (102,11,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTd2F0aGkiLCJpYXQiOjE3NjkwOTk3MDcsImV4cCI6MTc2OTEwMzMwN30.7f8bolGOFkRBKOD7-Rj1YdHDV4ffC7aOrkAKMUI2dQDK80xDWyDZsbgcIFNEgmZ3L7HTzRqg0Sta67MDmzq55A','2026-01-22 16:35:08','2026-01-22 17:35:08'),(103,13,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBcnBpdGhhIiwiaWF0IjoxNzY5MTAwMzI1LCJleHAiOjE3NjkxMDM5MjV9.Ay73OSXDnXXOem1cv_5VByep4s5xi-ZJWDyrXUmbOihuZ4CH9kWGVm8x5bS7e1Gnv93eHkwmE-mkNjWf5QZcNw','2026-01-22 16:45:25','2026-01-22 17:45:26'),(104,14,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBbW1hQW1tYSIsImlhdCI6MTc2OTEwMTEzMiwiZXhwIjoxNzY5MTA0NzMyfQ.LMXMc9MbPtrwLpp8WDPqqbYgj_xDcpH8hH6cECEAg3o6L807Af4s8PrJ4M0cCQxPsWbwX-2TnZh08t871CprMw','2026-01-22 16:58:52','2026-01-22 17:58:52');
/*!40000 ALTER TABLE `jwt_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jwt_tokens_seq`
--

DROP TABLE IF EXISTS `jwt_tokens_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jwt_tokens_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_tokens_seq`
--

LOCK TABLES `jwt_tokens_seq` WRITE;
/*!40000 ALTER TABLE `jwt_tokens_seq` DISABLE KEYS */;
INSERT INTO `jwt_tokens_seq` VALUES (201);
/*!40000 ALTER TABLE `jwt_tokens_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productimages`
--

DROP TABLE IF EXISTS `productimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productimages` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` text NOT NULL,
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimages`
--

LOCK TABLES `productimages` WRITE;
/*!40000 ALTER TABLE `productimages` DISABLE KEYS */;
/*!40000 ALTER TABLE `productimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (9,'testuser','test@example.com','$2a$10$7JFxT4iLWmldmdlaNWdo5Olri/yHcB/VinV9.eCzE/t6klZN77ytO','CUSTOMER','2026-01-22 12:38:07','2026-01-22 12:38:07'),(10,'Akshatha H M','akshatha.cy22@sahyadri.edu.in','$2a$10$A.Gy5.pR6dMktApt5PA9LurgdFSh45PeXPZUdy6y1B4iJl13ccmiW','CUSTOMER','2026-01-22 12:47:27','2026-01-22 12:47:28'),(11,'Swathi','swathi@gmail.com','$2a$10$yu6OcObYrL13EkZOVdkNPuwyF5EOgrLVU8OS3rIuYRwM.xCoT08bS','CUSTOMER','2026-01-22 16:34:47','2026-01-22 16:34:47'),(12,'Mamatha','mamatha@gmail.com','$2a$10$aJeFyXcFR1QaAFoM8sIS6u.1HlMWxx55tdlpMe5UHLVd0Uyi6eMpe','CUSTOMER','2026-01-22 16:36:17','2026-01-22 16:36:17'),(13,'Arpitha','arpitha@gmail.com','$2a$10$noFhWRkfWcTPjT8VD9uhGuxWUOE9uKGXRJQBIYzsxPE5eDUHD4ZPe','CUSTOMER','2026-01-22 16:44:49','2026-01-22 16:44:50'),(14,'AmmaAmma','amma@gmail.com','$2a$10$kxqP6og9S9STLj8uZ/fi3eMij6qwXndBq9grEZ1PnqRfUJw3sMLGu','CUSTOMER','2026-01-22 16:58:35','2026-01-22 16:58:36'),(15,'Ben','ben@gmail.com','$2a$10$UhNtWberGwebe12lgo9cn.jA9z8nJvMDsopDo1KplGJ.6ejSa5xse','CUSTOMER','2026-01-22 17:15:46','2026-01-22 17:15:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-23  0:47:20
