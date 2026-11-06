ALTER TABLE users
  MODIFY COLUMN status ENUM('pending', 'active', 'suspended', 'rejected') NOT NULL DEFAULT 'pending';
