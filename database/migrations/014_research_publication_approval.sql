ALTER TABLE research_publications
  ADD COLUMN status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending' AFTER researcher_id;
