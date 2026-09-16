-- Dashboard domain tables. The existing users and crops tables are the parent records.

CREATE TABLE farms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  location_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_farms_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_farms_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  INDEX idx_farms_owner (owner_id)
);

CREATE TABLE fields (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  farm_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  area_hectares DECIMAL(10,2) NULL,
  soil_type VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fields_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  INDEX idx_fields_farm (farm_id)
);

CREATE TABLE crop_plantings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  field_id BIGINT UNSIGNED NOT NULL,
  crop_id BIGINT UNSIGNED NOT NULL,
  planted_on DATE NULL,
  expected_harvest_on DATE NULL,
  health_status ENUM('healthy', 'watch', 'critical') NOT NULL DEFAULT 'healthy',
  progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plantings_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
  CONSTRAINT fk_plantings_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE RESTRICT,
  CONSTRAINT chk_planting_progress CHECK (progress_percent <= 100),
  INDEX idx_plantings_field (field_id),
  INDEX idx_plantings_crop (crop_id)
);

CREATE TABLE knowledge_articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id CHAR(36) NULL,
  crop_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  summary TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  INDEX idx_articles_category (category),
  INDEX idx_articles_crop (crop_id)
);

CREATE TABLE recommendations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  field_id BIGINT UNSIGNED NULL,
  crop_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  status ENUM('ready', 'dismissed', 'completed') NOT NULL DEFAULT 'ready',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_recommendations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
  CONSTRAINT fk_recommendations_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  INDEX idx_recommendations_user_status (user_id, status)
);

CREATE TABLE weather_snapshots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id BIGINT UNSIGNED NOT NULL,
  temperature_c DECIMAL(5,2) NOT NULL,
  humidity_percent DECIMAL(5,2) NULL,
  rainfall_probability_percent DECIMAL(5,2) NULL,
  wind_kph DECIMAL(6,2) NULL,
  condition_label VARCHAR(80) NULL,
  observed_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_weather_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_weather_location_time (location_id, observed_at)
);

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  farm_id BIGINT UNSIGNED NULL,
  report_type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
  INDEX idx_reports_user_date (user_id, created_at)
);

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  recommendation_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_recommendation FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL,
  INDEX idx_notifications_user_read (user_id, read_at)
);