-- AgriKMS Crop Advisor Migration

CREATE TABLE IF NOT EXISTS crop_advisor_analyses (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  image_name VARCHAR(255) NULL,
  location_name VARCHAR(255) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  image_observations LONGTEXT NOT NULL,
  internal_research LONGTEXT NOT NULL,
  web_research LONGTEXT NOT NULL,
  environmental_data LONGTEXT NOT NULL,
  recommendations LONGTEXT NOT NULL,
  less_suitable LONGTEXT NOT NULL,
  confidence_score LONGTEXT NOT NULL,
  missing_information LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
