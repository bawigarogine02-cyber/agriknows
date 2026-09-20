ALTER TABLE users
  ADD COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user' AFTER email,
  ADD COLUMN status ENUM('active', 'suspended') NOT NULL DEFAULT 'active' AFTER role;
