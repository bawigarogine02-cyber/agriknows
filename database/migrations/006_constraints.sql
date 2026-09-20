-- Migration 006: Foreign Keys, Constraints, and Indexes

-- ============================================================================
-- 1. Farms Constraints & Indexes
-- ============================================================================
ALTER TABLE farms
  ADD CONSTRAINT fk_farms_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_farms_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX idx_farms_owner ON farms (owner_id);

-- ============================================================================
-- 2. Fields Constraints & Indexes
-- ============================================================================
ALTER TABLE fields
  ADD CONSTRAINT fk_fields_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_fields_crop FOREIGN KEY (current_crop_id) REFERENCES crops(id) ON DELETE SET NULL;

CREATE INDEX idx_fields_farm ON fields (farm_id);

-- ============================================================================
-- 3. Crop Plantings Constraints & Indexes
-- ============================================================================
ALTER TABLE crop_plantings
  ADD CONSTRAINT fk_plantings_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_plantings_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_planting_progress CHECK (progress_percent <= 100);

CREATE INDEX idx_plantings_field ON crop_plantings (field_id);
CREATE INDEX idx_plantings_crop ON crop_plantings (crop_id);

-- ============================================================================
-- 4. Knowledge Articles Constraints & Indexes
-- ============================================================================
ALTER TABLE knowledge_articles
  ADD CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_articles_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL;

CREATE INDEX idx_articles_category ON knowledge_articles (category);
CREATE INDEX idx_articles_crop ON knowledge_articles (crop_id);

-- ============================================================================
-- 5. Recommendations Constraints & Indexes
-- ============================================================================
ALTER TABLE recommendations
  ADD CONSTRAINT fk_recommendations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_recommendations_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_recommendations_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL;

CREATE INDEX idx_recommendations_user_status ON recommendations (user_id, status);

-- ============================================================================
-- 6. Weather Snapshots Constraints & Indexes
-- ============================================================================
ALTER TABLE weather_snapshots
  ADD CONSTRAINT fk_weather_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

CREATE INDEX idx_weather_location_time ON weather_snapshots (location_id, observed_at);

-- ============================================================================
-- 7. Reports Constraints & Indexes
-- ============================================================================
ALTER TABLE reports
  ADD CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_reports_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL;

CREATE INDEX idx_reports_user_date ON reports (user_id, created_at);

-- ============================================================================
-- 8. Notifications Constraints & Indexes
-- ============================================================================
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_notifications_recommendation FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL;

CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_at);

-- ============================================================================
-- 9. Users Indexes
-- ============================================================================
CREATE INDEX idx_users_role_status ON users (role, status);

-- ============================================================================
-- 10. Site Settings Constraints
-- ============================================================================
ALTER TABLE site_settings
  ADD CONSTRAINT fk_site_settings_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 11. Pests & Diseases Constraints & Indexes
-- ============================================================================
ALTER TABLE pests_diseases
  ADD CONSTRAINT fk_pests_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE;

CREATE INDEX idx_pests_type ON pests_diseases (type);

-- ============================================================================
-- 12. Consultations Constraints & Indexes
-- ============================================================================
ALTER TABLE consultations
  ADD CONSTRAINT fk_consultations_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_consultations_researcher FOREIGN KEY (researcher_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_consultations_status ON consultations (status);

-- ============================================================================
-- 13. Consultation Replies Constraints
-- ============================================================================
ALTER TABLE consultation_replies
  ADD CONSTRAINT fk_replies_consultation FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_replies_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- 14. Research Publications Constraints
-- ============================================================================
ALTER TABLE research_publications
  ADD CONSTRAINT fk_pubs_researcher FOREIGN KEY (researcher_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- 15. Audit Logs Constraints & Indexes
-- ============================================================================
ALTER TABLE audit_logs
  ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_audit_date ON audit_logs (created_at DESC);
