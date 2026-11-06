CREATE TABLE user_preferences (
  user_id CHAR(36) PRIMARY KEY,
  default_farm_id BIGINT UNSIGNED NULL,
  units ENUM('metric', 'imperial') NOT NULL DEFAULT 'metric',
  notify_weather BOOLEAN NOT NULL DEFAULT TRUE,
  notify_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_preferences_farm FOREIGN KEY (default_farm_id) REFERENCES farms(id) ON DELETE SET NULL
);
