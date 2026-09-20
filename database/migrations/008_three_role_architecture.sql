-- Strict Three-Role Architecture Migration

UPDATE users SET role = 'farmer' WHERE role = 'user' OR role NOT IN ('farmer', 'researcher', 'admin');

ALTER TABLE users 
  MODIFY COLUMN role ENUM('farmer', 'researcher', 'admin') NOT NULL DEFAULT 'farmer';
