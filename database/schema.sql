-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: salessavvy
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
  KEY `fk_cart_user` (`user_id`),
  KEY `fk_cart_product` (`product_id`),
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,1,1),(2,1,2,1),(3,1,3,2);
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
  UNIQUE KEY `uk_category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (3,'Accessories'),(5,'Mobile Accessories'),(4,'Mobiles'),(2,'Pants'),(1,'Shirts');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `UKlroeo5fvfdeg4hpicn4lw7x9b` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
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
  `token` varchar(1000) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`token_id`),
  KEY `fk_jwt_user` (`user_id`),
  CONSTRAINT `fk_jwt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_tokens`
--

LOCK TABLES `jwt_tokens` WRITE;
/*!40000 ALTER TABLE `jwt_tokens` DISABLE KEYS */;
INSERT INTO `jwt_tokens` VALUES (2,2,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJNYW5hc2EiLCJpYXQiOjE3NzAwNDYyODcsImV4cCI6MTc3MDA0OTg4N30.xUaPTevq4huQ4PJA2qcXWfWkdm7UEYsNAy84itjWwfObjO2ZlbjPGH42mp5NeIM96gvSiEND-aoqrvvkKDkclg','2026-02-02 15:31:27','2026-02-02 16:31:28'),(3,3,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBbnZpIiwiaWF0IjoxNzcwMDk4NzQ0LCJleHAiOjE3NzAxMDIzNDR9.JZGSxZ3wUlxk4MO9pV74y1VkiYqMNGsNf-6LJYLFhXb1ap3GuiGL2iBAWs3DMm7Jb_dxBd_3UHV8XeMxeiLTrQ','2026-02-03 06:05:44','2026-02-03 07:05:44'),(7,8,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBa3NoYXRoYSBIIE0iLCJpYXQiOjE3NzAxMTA4NjEsImV4cCI6MTc3MDExNDQ2MX0.S60HeutXICA-mW9U8NPkGxkizNW9A8vtwm4qnODGnaXM96cFUa8NqC4Gpaz3x0ZiSRVZSo0JZB46f9edMwSwVQ','2026-02-03 09:27:41','2026-02-03 10:27:41'),(8,10,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBa3NodTEiLCJpYXQiOjE3NzAxMTE0NDksImV4cCI6MTc3MDExNTA0OX0.WkFkWLkxb9FO-RlSGM9UsH-QDp77BLZbef6oPE67Qp5Vjukb2QLkXesJltvrxrf6FROrI843DJQmQlfhdmsFVw','2026-02-03 09:37:29','2026-02-03 10:37:29'),(9,11,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBa3NodTIiLCJpYXQiOjE3NzAxMTY0MzIsImV4cCI6MTc3MDEyMDAzMn0.KGaUqV8dcuX-tCToJPMcg9_bgHQCk_zRafZhKB-6c3dznVOSFZE9ZZu5vTpHu1wpzTozguk7oY2kbJnA7U3I_Q','2026-02-03 11:00:32','2026-02-03 12:00:33'),(10,12,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBa2FzaCIsImlhdCI6MTc3MDExODExNSwiZXhwIjoxNzcwMTIxNzE1fQ.v-f-kdpwZUSrl8FkX5U_g_KllxDK5PRnDUmYrjvs8rUnxNrDDDCpLJHUGJNCOAsTtK4ywklpU_LTowO2rcOi9Q','2026-02-03 11:28:35','2026-02-03 12:28:36'),(11,13,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBa2t1MSIsImlhdCI6MTc3MDExODIzMSwiZXhwIjoxNzcwMTIxODMxfQ.G9oEQwGFDzk2JWSnhMDGtFNLwTFbNWhaOfg1Exggw8pJhwnSYtE8SKaXHScLTI-9ETf0MuP3ZU9eOcUl-t3AMQ','2026-02-03 11:30:31','2026-02-03 12:30:32'),(12,14,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTd2F0aGkiLCJpYXQiOjE3NzAxMTk1ODksImV4cCI6MTc3MDEyMzE4OX0.JQWkAiU8iBU_3IUbMiNxTRjiqCC388qRJsdbm2HQY6MH0z2C-FnK_3B147uur0kV_tnMhNifg1ILGYSo0u-F7A','2026-02-03 11:53:09','2026-02-03 12:53:09'),(13,7,'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBa3NodSIsImlhdCI6MTc3MDEyMjgzMCwiZXhwIjoxNzcwMTI2NDMwfQ.IMRbKFaxf86qmF6O4BPTIE-_YN6jceHgAH6NX9gcbtd5LzvZ8Vww58ScXcbwmo-gl7UFe8AQPRB-Lw8NRPCqyw','2026-02-03 12:47:11','2026-02-03 13:47:11');
/*!40000 ALTER TABLE `jwt_tokens` ENABLE KEYS */;
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
  `price_per_unit` decimal(38,2) NOT NULL,
  `total_price` decimal(38,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_orderitem_order` (`order_id`),
  KEY `fk_orderitem_product` (`product_id`),
  CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_orderitem_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'order_SBKK8IMMkTS2Yn',1,1,499.99,499.99),(2,'order_SBKK8IMMkTS2Yn',2,1,599.99,599.99),(3,'order_SBKK8IMMkTS2Yn',3,2,699.99,1399.98),(4,'order_SBKK9yfc32Ky3o',1,1,499.99,499.99),(5,'order_SBKK9yfc32Ky3o',2,1,599.99,599.99),(6,'order_SBKK9yfc32Ky3o',3,2,699.99,1399.98),(7,'order_SBKKMeXiHObYW3',1,1,499.99,499.99),(8,'order_SBKKMeXiHObYW3',2,1,599.99,599.99),(9,'order_SBKKMeXiHObYW3',3,2,699.99,1399.98),(10,'order_SBKXT41GlUqpTv',1,1,499.99,499.99),(11,'order_SBKXT41GlUqpTv',2,1,599.99,599.99),(12,'order_SBKXT41GlUqpTv',3,2,699.99,1399.98),(13,'order_SBKb0XnprmKiNz',1,1,499.99,499.99),(14,'order_SBKb0XnprmKiNz',2,1,599.99,599.99),(15,'order_SBKb0XnprmKiNz',3,2,699.99,1399.98),(16,'order_SBZXcIwJ6r27My',62,1,349.50,349.50),(17,'order_SBZXcIwJ6r27My',3,1,699.99,699.99),(18,'order_SBZXcIwJ6r27My',2,1,599.99,599.99),(19,'order_SBZYGSjAsJSyvO',62,1,349.50,349.50),(20,'order_SBZYGSjAsJSyvO',3,1,699.99,699.99),(21,'order_SBZYGSjAsJSyvO',2,1,599.99,599.99),(22,'order_SBZdYxeO3yS7gg',62,1,349.50,349.50),(23,'order_SBZdYxeO3yS7gg',3,1,699.99,699.99),(24,'order_SBZdYxeO3yS7gg',2,1,599.99,599.99),(25,'order_SBZdh7tDDWot3A',62,1,349.50,349.50),(26,'order_SBZdh7tDDWot3A',3,1,699.99,699.99),(27,'order_SBZdh7tDDWot3A',2,1,599.99,599.99),(28,'order_SBZfeXZbG4LA8y',62,1,349.50,349.50),(29,'order_SBZfeXZbG4LA8y',3,1,699.99,699.99),(30,'order_SBZfeXZbG4LA8y',2,1,599.99,599.99),(31,'order_SBZjoY8yQ14odx',62,1,349.50,349.50),(32,'order_SBZjoY8yQ14odx',3,1,699.99,699.99),(33,'order_SBZjoY8yQ14odx',2,1,599.99,599.99),(34,'order_SBZmL4jlYFSCak',62,1,349.50,349.50),(35,'order_SBZmL4jlYFSCak',3,1,699.99,699.99),(36,'order_SBZmL4jlYFSCak',2,1,599.99,599.99),(37,'order_SBZmt7q3tRdoq9',62,1,349.50,349.50),(38,'order_SBZmt7q3tRdoq9',3,1,699.99,699.99),(39,'order_SBZmt7q3tRdoq9',2,1,599.99,599.99),(40,'order_SBaDR1mGNoVQKR',62,1,349.50,349.50),(41,'order_SBaDR1mGNoVQKR',3,1,699.99,699.99),(42,'order_SBaDR1mGNoVQKR',2,1,599.99,599.99),(43,'order_SBaINMyaWLaaCN',62,1,349.50,349.50),(44,'order_SBaINMyaWLaaCN',3,1,699.99,699.99),(45,'order_SBaINMyaWLaaCN',2,1,599.99,599.99),(46,'order_SBaIUXaX9fJw1A',62,1,349.50,349.50),(47,'order_SBaIUXaX9fJw1A',3,1,699.99,699.99),(48,'order_SBaIUXaX9fJw1A',2,1,599.99,599.99),(49,'order_SBaMOrpqSEOhEs',62,1,349.50,349.50),(50,'order_SBaMOrpqSEOhEs',3,1,699.99,699.99),(51,'order_SBaMOrpqSEOhEs',2,1,599.99,599.99),(52,'order_SBcGor6iqDH9aJ',62,1,349.50,349.50),(53,'order_SBcGor6iqDH9aJ',3,1,699.99,699.99),(54,'order_SBcGor6iqDH9aJ',2,1,599.99,599.99),(55,'order_SBcRRFHgddRlhY',62,1,349.50,349.50),(56,'order_SBcRRFHgddRlhY',3,1,699.99,699.99),(57,'order_SBcRRFHgddRlhY',2,1,599.99,599.99),(58,'order_SBcSSmqphvC2lZ',62,1,349.50,349.50),(59,'order_SBcSSmqphvC2lZ',3,6,699.99,4199.94),(60,'order_SBcSSmqphvC2lZ',2,1,599.99,599.99),(61,'order_SBcSSmqphvC2lZ',27,1,750.00,750.00),(62,'order_SBcSSmqphvC2lZ',28,1,800.00,800.00),(63,'order_SBcSSmqphvC2lZ',75,1,99.00,99.00),(64,'order_SBcSSmqphvC2lZ',81,1,999.00,999.00),(65,'order_SBenup4PVHu7pI',48,1,22999.00,22999.00),(66,'order_SBenup4PVHu7pI',49,1,8999.50,8999.50),(67,'order_SBenup4PVHu7pI',50,1,39999.00,39999.00),(68,'order_SBfOChfxClwJs0',2,1,599.99,599.99);
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
  `total_amount` decimal(38,2) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('order_SBaDR1mGNoVQKR',7,1649.48,'PENDING','2026-02-03 07:01:48',NULL),('order_SBaINMyaWLaaCN',7,1649.48,'PENDING','2026-02-03 07:06:28',NULL),('order_SBaIUXaX9fJw1A',7,1649.48,'PENDING','2026-02-03 07:06:35',NULL),('order_SBaMOrpqSEOhEs',7,1649.48,'PENDING','2026-02-03 07:10:17',NULL),('order_SBcGor6iqDH9aJ',7,1649.48,'PENDING','2026-02-03 09:02:23',NULL),('order_SBcRRFHgddRlhY',7,1649.48,'PENDING','2026-02-03 09:12:26',NULL),('order_SBcSSmqphvC2lZ',7,7797.43,'SUCCESS','2026-02-03 09:13:24','2026-02-03 09:14:41'),('order_SBenup4PVHu7pI',13,71997.50,'SUCCESS','2026-02-03 11:31:06','2026-02-03 11:31:43'),('order_SBfOChfxClwJs0',14,599.99,'SUCCESS','2026-02-03 12:05:27','2026-02-03 12:05:52'),('order_SBKb0XnprmKiNz',1,2499.96,'PENDING','2026-02-02 15:44:59',NULL),('order_SBKK8IMMkTS2Yn',1,2499.96,'PENDING','2026-02-02 15:29:01',NULL),('order_SBKK9yfc32Ky3o',1,2499.96,'PENDING','2026-02-02 15:29:02',NULL),('order_SBKKMeXiHObYW3',1,2499.96,'PENDING','2026-02-02 15:29:14',NULL),('order_SBKXT41GlUqpTv',1,2499.96,'PENDING','2026-02-02 15:41:38',NULL),('order_SBZdh7tDDWot3A',7,1649.48,'PENDING','2026-02-03 06:27:57',NULL),('order_SBZdYxeO3yS7gg',7,1649.48,'PENDING','2026-02-03 06:27:50',NULL),('order_SBZfeXZbG4LA8y',7,1649.48,'PENDING','2026-02-03 06:29:49',NULL),('order_SBZjoY8yQ14odx',7,1649.48,'PENDING','2026-02-03 06:33:45',NULL),('order_SBZmL4jlYFSCak',7,1649.48,'PENDING','2026-02-03 06:36:08',NULL),('order_SBZmt7q3tRdoq9',7,1649.48,'PENDING','2026-02-03 06:36:40',NULL),('order_SBZXcIwJ6r27My',7,1649.48,'PENDING','2026-02-03 06:22:12',NULL),('order_SBZYGSjAsJSyvO',7,1649.48,'PENDING','2026-02-03 06:22:49',NULL);
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
  KEY `idx_product` (`product_id`),
  CONSTRAINT `fk_productimages_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimages`
--

LOCK TABLES `productimages` WRITE;
/*!40000 ALTER TABLE `productimages` DISABLE KEYS */;
INSERT INTO `productimages` VALUES (1,1,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(2,2,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt10.png'),(3,3,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt11.png'),(4,4,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt12.png'),(5,5,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt12.png'),(6,6,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt14.png'),(7,7,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt15.png'),(8,8,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt2.png'),(9,9,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(10,10,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(11,11,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(12,12,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(13,13,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(14,14,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt11.png'),(15,15,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt12.png'),(17,17,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt14.png'),(18,18,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt15.png'),(19,19,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt10.png'),(20,20,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(21,21,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph12.png'),(22,22,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph13.png'),(23,23,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph14.png'),(24,24,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph15.png'),(25,25,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph16.png'),(26,26,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph17.png'),(27,27,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph2.png'),(28,28,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph3.png'),(29,29,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph4.png'),(30,30,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph5.png'),(31,31,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv1.png'),(32,32,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv10.png'),(33,33,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv11.png'),(34,34,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv12.png'),(35,35,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv13.png'),(36,36,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv14.png'),(37,37,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv15.png'),(38,38,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv2.png'),(39,39,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv3.png'),(40,40,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv4.png'),(41,41,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv5.png'),(42,42,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv6.png'),(43,43,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv7.png'),(44,44,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv8.png'),(45,45,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv9.png'),(46,46,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv9.png'),(47,47,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(48,48,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(49,49,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(50,50,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(51,51,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(53,53,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(54,54,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(56,56,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(57,57,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(58,58,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(59,59,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(60,60,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(61,61,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(62,62,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(63,63,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(64,64,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(65,65,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(66,66,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(68,68,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(69,69,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(70,70,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(72,72,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(73,73,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(74,74,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv7.png'),(75,75,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(76,76,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(77,77,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(78,78,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/tv7.png'),(79,79,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(80,80,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(81,81,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(82,82,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(83,83,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(84,84,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(85,85,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(86,86,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(87,87,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(88,88,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(89,89,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(90,90,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(91,91,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(92,92,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(93,93,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(94,94,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/ph11.png'),(95,95,'https://production-inventory-service.s3.ap-south-1.amazonaws.com/kodnest-documents/salessavvy/COSTOMER+IMAGES/shirt1.png'),(96,99,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_TrlzrT6LdPQFFm0x5a3eiH_MVxghBhkI5w&s'),(97,100,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_TrlzrT6LdPQFFm0x5a3eiH_MVxghBhkI5w&s');
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
  KEY `idx_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Shirt1','Stylish Shirt1',499.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(2,'Shirt2','Stylish Shirt2',599.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(3,'Shirt3','Stylish Shirt3',699.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(4,'Shirt4','Stylish Shirt4',799.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(5,'Shirt5','Stylish Shirt5',899.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(6,'Shirt6','Stylish Shirt6',999.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(7,'Shirt7','Stylish Shirt7',1099.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(8,'Shirt8','Stylish Shirt8',1199.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(9,'Shirt9','Stylish Shirt9',1299.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(10,'Shirt10','Stylish Shirt10',1399.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(11,'Shirt11','Stylish Shirt11',1499.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(12,'Shirt12','Best Shirt In the Segment',987.00,200,1,'2025-01-27 09:28:30','2025-02-10 00:05:12'),(13,'Shirt13','Stylish Shirt13',1699.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(14,'Shirt14','Stylish Shirt14',1799.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(15,'Shirt15','Stylish Shirt15',1899.99,100,1,'2025-01-01 06:41:26','2025-01-01 06:41:26'),(16,'Pant1','Stylish Pant1',799.99,50,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(17,'Pant2','Stylish Pant2',899.50,45,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(18,'Pant3','Stylish Pant3',759.99,40,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(19,'Pant4','Stylish Pant4',689.99,55,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(20,'Pant5','Stylish Pant5',999.99,30,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(21,'Pant6','Stylish Pant6',699.99,20,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(22,'Pant7','Stylish Pant7',849.50,35,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(23,'Pant8','Stylish Pant8',799.00,60,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(24,'Pant9','Stylish Pant9',729.99,25,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(25,'Pant10','Stylish Pant10',889.99,50,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(26,'Pant11','Stylish Pant11',819.99,40,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(27,'Shirt Colourful','Best Shirt',750.00,50,1,'2025-01-27 09:28:30','2025-01-27 09:28:30'),(28,'cool shirt','colourful shirt',800.00,50,1,'2025-01-27 09:28:30','2025-01-27 09:28:30'),(29,'Best color Shirt','Cool color shirt',900.00,90,1,'2025-01-27 09:28:30','2025-03-17 06:24:39'),(30,'Pant15','Stylish Pant15',899.99,90,2,'2025-01-04 13:38:11','2025-01-04 13:38:11'),(31,'TV1','Smart TV1 with HD display',18999.99,20,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(32,'TV2','Smart TV2 with Full HD display',21999.50,15,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(33,'TV3','Smart TV3 with 4K display',29999.00,10,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(34,'TV4','Smart TV4 with HDR and Dolby Vision',25999.99,12,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(35,'TV5','Smart TV5 with Ultra HD screen',34999.99,8,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(36,'TV6','Smart TV6 with Alexa Built-in',27999.50,18,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(37,'TV7','Smart TV7 with Android OS',22999.00,22,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(38,'TV8','Smart TV8 with High Refresh Rate',31999.99,14,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(39,'TV9','Smart TV9 with Thin Bezels',24999.99,20,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(40,'TV10','Smart TV10 with AI Upscaling',39999.00,5,3,'2025-01-04 13:58:04','2025-01-04 14:28:22'),(41,'Speaker','Worlds BEst',12999.99,50,3,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(42,'Nikon DSLR','Indias best',8999.50,75,3,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(43,'NIK DSLR2','Sales Choice',15999.00,40,3,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(44,'NIC DSLR3','Capture Nik',19999.99,30,3,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(45,'LAPTOP','Smart TV15 with AI Upscaling',24999.99,25,3,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(46,'Mobile1','Mobile6 with gaming chipset and high refresh rate',19999.99,50,4,'2025-01-04 14:01:27','2025-01-04 14:42:48'),(47,'Mobile2','Mobile7 with gaming chipset and high refresh rate',8999.50,55,4,'2025-01-04 14:01:27','2025-01-04 14:42:48'),(48,'Mobile3','Mobile8 with gaming chipset and high refresh rate',22999.00,50,4,'2025-01-04 14:01:27','2025-01-04 14:42:48'),(49,'Mobile4','Mobile9 with gaming chipset and high refresh rate',8999.50,55,4,'2025-01-04 14:01:27','2025-01-04 14:42:48'),(50,'Mobile5','Mobile10 with gaming chipset and high refresh rate',39999.00,50,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(51,'Mobile6','Mobile10 with gaming chipset and high refresh rate',48765.00,30,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(53,'Mobile8','Mobile12with gaming chipset and high refresh rate',34598.00,345,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(54,'Mobile9','Mobile13 with gaming chipset and high refresh rate',45673.00,45,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(56,'Mobile11','Mobile15 with gaming chipset and high refresh rate',23412.00,65,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(57,'Mobile12','Mobile12 with gaming chipset and high refresh rate',89765.00,456,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(58,'Mobile13','Mobile14 with gaming chipset and high refresh rate',23456.00,567,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(59,'Mobile14','Mobile11 with gaming chipset and high refresh rate',99990.00,234,4,'2025-01-04 14:01:27','2025-01-04 14:44:51'),(60,'Mobile15','Mobile15 with gaming chipset and high refresh rate',45389.00,225,4,'2025-01-04 14:01:27','2025-01-06 09:41:42'),(61,'Mobile Accessory -1','Durable and practical mobile accessory for everyday use.',999.00,30,5,'2025-01-27 09:28:30','2025-03-17 06:28:55'),(62,'Mobile Accessory 2','Durable and practical mobile accessory for everyday use.',349.50,200,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(63,'Mobile Accessory 3','A versatile mobile accessory with modern features.',899.00,80,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(64,'Mobile Accessory 4','Reliable mobile accessory designed for convenience.',749.75,120,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(65,'Mobile Accessory 5','Mobile accessory offering comfort and durability.',199.99,250,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(66,'Mobile Accessory 6','A stylish and protective mobile accessory.',249.99,500,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(68,'Mobile Accessory 8','An essential mobile accessory designed for convenience.',399.50,350,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(69,'super','awesome',999.00,40,5,'2025-01-27 09:28:30','2025-08-29 01:44:06'),(70,'Mobile Accessory 10','Compact and efficient mobile accessory for all your needs.',1099.99,100,5,'2025-01-06 09:53:10','2025-01-06 09:53:10'),(71,'cool','verycool',876.00,50,5,'2025-01-27 00:33:52','2025-01-27 00:33:52'),(72,'Louies-2','Cool Louies 2.',156.99,321,1,'2025-01-21 09:03:32','2025-01-21 09:03:32'),(73,'awesome','awesome',8989.00,50,1,'2025-01-27 00:33:52','2025-08-29 01:46:02'),(74,'spykershirt','best shirt',999.00,100,1,'2025-01-22 13:27:55','2025-01-22 13:27:55'),(75,'Spy shirts','good cool',99.00,200,1,'2025-01-22 14:03:24','2025-01-22 14:03:24'),(76,'spyker hot shirt','best shirt',999.00,100,1,'2025-01-22 14:15:19','2025-01-22 14:15:19'),(77,'louies s[yker','cool hot shirt',854.00,20,1,'2025-01-22 14:18:57','2025-01-22 14:18:57'),(78,'78','marvalous',768.00,100,1,'2025-01-27 08:47:25','2025-08-29 01:49:14'),(79,'LouiesSpiker','wonderful striped shirt',899.00,200,1,'2025-01-26 23:09:32','2025-01-26 23:09:32'),(80,'spiker','adsjfkhbsjkdf',999.00,200,1,'2025-01-26 23:10:00','2025-01-26 23:10:00'),(81,'spyker12','wednc ewjhcew',999.00,20,1,'2025-01-26 23:56:17','2025-01-26 23:56:17'),(82,'gyshirt','dcjhbSJDHCac',899.00,10,1,'2025-01-27 00:02:17','2025-01-27 00:02:17'),(83,'aKS;JC','ZADJLNSV ',767.00,29,1,'2025-01-27 00:03:04','2025-01-27 00:03:04'),(84,'hgdv','wedjkcwev',644.00,10,1,'2025-01-27 00:11:08','2025-01-27 00:11:08'),(85,'sdfhjb1','sdkjvb',657.00,20,1,'2025-01-27 00:19:07','2025-01-27 00:19:07'),(86,'sdkfjn','sdfkjn',23.00,23,1,'2025-01-27 00:20:27','2025-01-27 00:20:27'),(87,'dsf','sdfb',23.00,23,1,'2025-01-27 00:23:04','2025-01-27 00:23:04'),(88,'dsfbvsdf','sdfb',23.00,21,1,'2025-01-27 00:25:04','2025-01-27 00:25:04'),(89,'shiet','asdvwefg',23.00,23,1,'2025-01-27 00:31:25','2025-01-27 00:31:25'),(90,'zdf','sdfb',23.00,23,1,'2025-01-27 00:33:52','2025-01-27 00:33:52'),(91,'shirtspyker','aschjadc',123.00,23,1,'2025-01-27 08:21:14','2025-01-27 08:21:14'),(92,'asdkjc','wdf',12.00,23,1,'2025-01-27 08:21:32','2025-01-27 08:21:32'),(93,'abc','dfghj',40.00,5,1,'2025-01-27 08:34:08','2025-01-27 08:34:08'),(94,'abc2','gyvhujnkml,',30.00,3,1,'2025-01-27 08:47:25','2025-01-27 08:47:25'),(95,'blueShirt','Awesome Blue Shirt',876.00,20,1,'2025-01-27 09:28:30','2025-01-27 00:33:52'),(96,'Iphone','vskhfsbvnfbvkjfsh',150000.00,1,3,'2026-02-03 09:48:33','2026-02-03 09:48:33'),(97,'Iphone','vskhfsbvnfbvkjfsh',150000.00,1,3,'2026-02-03 09:50:43','2026-02-03 09:50:43'),(98,'Iphone','vskhfsbvnfbvkjfsh',150000.00,1,3,'2026-02-03 09:53:59','2026-02-03 09:53:59'),(99,'iPhone','fnjdbvjwen vje',100000.00,1,1,'2026-02-03 11:01:02','2026-02-03 11:01:02'),(100,'iphone','vjdvjdbv',100000.00,1,1,'2026-02-03 11:09:54','2026-02-03 11:09:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Appa','appa1@gmail.com','$2a$10$yCybuE2L/arn5vOSjrhrCepxj30SNIW90P/h3M9NsB3EKqx/COeQ6','CUSTOMER','2026-02-02 15:26:23','2026-02-02 15:26:23'),(2,'Manasa','manasa@gmail.com','$2a$10$m7MoScCFpneCg4EByqhy4eLeMqsMGJuAJ6EgoMSoSXpjCWfNwVyTG','ADMIN','2026-02-02 15:31:04','2026-02-02 15:31:04'),(3,'Anvi','anvi@gmail.com','$2a$10$o2GEll4cvYyDWLM7N3vJiOiumGj3IDIpZiarnCFPj0ntF2b9ZRpNe','ADMIN','2026-02-03 06:05:32','2026-02-03 06:05:33'),(4,'Akku','akku@gmail.com','$2a$10$3q7vzzxlCPRSpZu354x5HuNifOoX6c5wW7MhixmRDr1f8AjPnouxW','ADMIN','2026-02-03 06:14:51','2026-02-03 06:14:52'),(5,'Akkku','akkku@gmail.com','$2a$10$c3GmXP9N8KyTKVlHjJcSueQA5nni5qgYQasXCioGj9MwhLgvPYPa2','CUSTOMER','2026-02-03 06:15:26','2026-02-03 06:15:26'),(6,'Arpi','arpi@gmail.com','$2a$10$Huw.m3ktmWnUPrjg1Wzar.yYarnvNTY8UmGKgaBISTB691SNDjMky','ADMIN','2026-02-03 06:16:43','2026-02-03 06:16:43'),(7,'Akshu','akshu@gmail.com','$2a$10$J9dsVYqaLWdiYgLmUPTbBu3k75n.nx8l3Q74J0IFtciUy4FEVVdoO','CUSTOMER','2026-02-03 06:18:35','2026-02-03 06:18:35'),(8,'Akshatha H M','akshathahmohan@gmail.com','$2a$10$bHDA7gXp9NTwjupcBxsX5OPuU22rPQeoFs0UA.gF9EotMvNBPqZOa','ADMIN','2026-02-03 09:27:28','2026-02-03 09:27:28'),(9,'Akshatha ','akshatha@gmail.com','$2a$10$0zPj5OPdGuhIFNAlJn23x.WIa8UfJ703o0TlBMHXFKTo4cVQh7oRG','ADMIN','2026-02-03 09:35:48','2026-02-03 09:35:48'),(10,'Akshu1','Akshu1@gmail.com','$2a$10$cbCclLw5mAr5PYooG2NyFOt7QJ5xkwEK7bDbLqHfuH0x4ULZ0oe.y','ADMIN','2026-02-03 09:37:18','2026-02-03 09:37:18'),(11,'Akshu2','akshu2@gmail.com','$2a$10$pRNbVftxfQK/6gahhEaWT.vH14H.HrNkd2NLpd96vltpfyBXhybkW','ADMIN','2026-02-03 11:00:18','2026-02-03 11:00:18'),(12,'Akash','akash@gmail.com','$2a$10$6CaWa5lrAAg0pE32FkwwfOBUBuTZCjWDShyP6GmJTiYWiNP1umqqK','ADMIN','2026-02-03 11:28:21','2026-02-03 11:28:22'),(13,'Akku1','akku1@gmail.com','$2a$10$PAb3KkDm6VZwth1/skRnkuvK9M2FHhyhp.Y7hNK9tJaPSXIHpw9a2','CUSTOMER','2026-02-03 11:30:20','2026-02-03 11:30:20'),(14,'Swathi','swathi@gmail.com','$2a$10$GSa0xzx5b7OHohXRmLY09.zsxp1cCcFCJVQ.LR.m8Ew1nn6qF0XrS','CUSTOMER','2026-02-03 11:49:36','2026-02-03 11:49:37');
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

-- Dump completed on 2026-02-03 23:27:02
