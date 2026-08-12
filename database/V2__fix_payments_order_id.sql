-- Safe migration: drop payments->orders FK if it exists, modify column, recreate FK
-- Backup your DB before running. Tested on MySQL 8+.

SET @db = DATABASE();

-- Find an existing FK referencing orders(order_id) from payments (if any)
SELECT
	CONSTRAINT_NAME
INTO @fk_name
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = @db
	AND TABLE_NAME = 'payments'
	AND REFERENCED_TABLE_NAME = 'orders'
LIMIT 1;

-- If found, drop it
SET @drop_stmt = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE `payments` DROP FOREIGN KEY `', @fk_name, '`;'), NULL);
IF @drop_stmt IS NOT NULL THEN
	PREPARE stmt FROM @drop_stmt;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END IF;

-- Ensure payments.order_id column exists before altering
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'order_id';

IF @col_exists = 1 THEN
	ALTER TABLE `payments` MODIFY COLUMN `order_id` VARCHAR(255) NOT NULL;
ELSE
	-- If column doesn't exist, create it to match orders.order_id
	ALTER TABLE `payments` ADD COLUMN `order_id` VARCHAR(255) NOT NULL;
END IF;

-- Recreate foreign key constraint to orders(order_id)
ALTER TABLE `payments` ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`);
