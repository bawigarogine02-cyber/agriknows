CREATE TABLE site_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_by CHAR(36) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO site_settings (setting_key, setting_value)
VALUES
  ('site_title', 'AgriKnow'),
  ('site_description', 'Agricultural knowledge and decision support for modern farms.'),
  ('canonical_url', 'http://localhost:3000')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
