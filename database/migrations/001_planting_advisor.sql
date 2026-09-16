CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE crops (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  season VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crop_requirements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  crop_id BIGINT UNSIGNED NOT NULL,
  min_temperature DECIMAL(5,2), max_temperature DECIMAL(5,2),
  min_rainfall DECIMAL(8,2), max_rainfall DECIMAL(8,2),
  min_soil_temperature DECIMAL(5,2), max_soil_temperature DECIMAL(5,2),
  min_soil_moisture DECIMAL(5,2), max_soil_moisture DECIMAL(5,2),
  sunlight VARCHAR(40), terrain VARCHAR(120),
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

CREATE TABLE analyses (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  image_reference TEXT,
  ai_analysis JSON,
  missing_information JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE weather_data (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analysis_id CHAR(36) NOT NULL,
  payload JSON NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
);

CREATE TABLE soil_data (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analysis_id CHAR(36) NOT NULL,
  payload JSON NOT NULL,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
);

CREATE TABLE crop_recommendations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analysis_id CHAR(36) NOT NULL,
  crop_id BIGINT UNSIGNED,
  crop_name VARCHAR(120) NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  confidence VARCHAR(30) NOT NULL,
  explanation TEXT NOT NULL,
  risks JSON,
  considerations JSON,
  next_steps JSON,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

CREATE TABLE recommendation_factors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recommendation_id BIGINT UNSIGNED NOT NULL,
  factor_name VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL,
  detail VARCHAR(255) NOT NULL,
  FOREIGN KEY (recommendation_id) REFERENCES crop_recommendations(id) ON DELETE CASCADE
);
