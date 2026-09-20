-- AgriKMS 6 Modules Schema Alignment Migration

-- 1. Ensure Users table has role and status enum values
ALTER TABLE users 
  MODIFY COLUMN role ENUM('farmer', 'researcher', 'admin', 'user') NOT NULL DEFAULT 'farmer',
  MODIFY COLUMN status ENUM('active', 'suspended') NOT NULL DEFAULT 'active';

-- 2. Enhance Farms table with soil_type and total_area
ALTER TABLE farms 
  ADD COLUMN soil_type VARCHAR(100) NULL AFTER location_id,
  ADD COLUMN total_area DECIMAL(10,2) NULL AFTER soil_type;

-- 3. Enhance Fields table with agronomic parameters
ALTER TABLE fields 
  ADD COLUMN current_crop_id BIGINT UNSIGNED NULL AFTER area_hectares,
  ADD COLUMN planting_date DATE NULL AFTER current_crop_id,
  ADD COLUMN soil_ph DECIMAL(3,1) DEFAULT 6.5 AFTER planting_date,
  ADD COLUMN organic_matter DECIMAL(4,1) DEFAULT 2.5 AFTER soil_ph,
  ADD COLUMN water_source VARCHAR(100) DEFAULT 'Rainfed' AFTER organic_matter,
  ADD COLUMN is_harvested BOOLEAN DEFAULT FALSE AFTER water_source;

-- 4. Enhance Crops table with agronomic target bounds
ALTER TABLE crops
  ADD COLUMN ideal_ph_min DECIMAL(3,1) DEFAULT 6.0 AFTER season,
  ADD COLUMN ideal_ph_max DECIMAL(3,1) DEFAULT 7.5 AFTER ideal_ph_min,
  ADD COLUMN water_requirement VARCHAR(100) DEFAULT 'Moderate (400-600mm)' AFTER ideal_ph_max,
  ADD COLUMN growth_days INT UNSIGNED DEFAULT 90 AFTER water_requirement,
  ADD COLUMN climate VARCHAR(120) DEFAULT 'Tropical & Subtropical' AFTER growth_days,
  ADD COLUMN companion_crops VARCHAR(255) DEFAULT 'Legumes, Marigold, Basil' AFTER climate;

-- 5. Create Pests & Diseases table
CREATE TABLE IF NOT EXISTS pests_diseases (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  crop_id BIGINT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  type ENUM('insect', 'fungus', 'bacterial', 'virus') NOT NULL DEFAULT 'insect',
  symptoms TEXT NOT NULL,
  prevention TEXT NOT NULL,
  treatment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enhance Recommendations table for decision support parameters
ALTER TABLE recommendations
  ADD COLUMN type ENUM('fertilizer', 'irrigation', 'general') NOT NULL DEFAULT 'general' AFTER crop_id,
  ADD COLUMN rule_applied VARCHAR(255) NULL AFTER type,
  ADD COLUMN output_text LONGTEXT NULL AFTER rule_applied,
  ADD COLUMN crop_stage VARCHAR(60) NULL AFTER output_text,
  ADD COLUMN rainfall_recent VARCHAR(60) NULL AFTER crop_stage,
  ADD COLUMN observed_issues VARCHAR(255) NULL AFTER rainfall_recent;

-- 7. Create Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id CHAR(36) PRIMARY KEY,
  farmer_id CHAR(36) NOT NULL,
  researcher_id CHAR(36) NULL,
  crop_name VARCHAR(120) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  status ENUM('Pending Review', 'Answered', 'Closed') NOT NULL DEFAULT 'Pending Review',
  image_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Create Consultation Replies table
CREATE TABLE IF NOT EXISTS consultation_replies (
  id CHAR(36) PRIMARY KEY,
  consultation_id CHAR(36) NOT NULL,
  sender_id CHAR(36) NOT NULL,
  message LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Research Publications table
CREATE TABLE IF NOT EXISTS research_publications (
  id CHAR(36) PRIMARY KEY,
  researcher_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  abstract LONGTEXT NOT NULL,
  pdf_url VARCHAR(500) NOT NULL,
  crop_type VARCHAR(120) NOT NULL,
  soil_type VARCHAR(100) NOT NULL,
  publication_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(160) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  device_info VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
