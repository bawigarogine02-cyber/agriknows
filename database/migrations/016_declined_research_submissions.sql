ALTER TABLE research_publications
  MODIFY COLUMN status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending';

ALTER TABLE pests_diseases
  MODIFY COLUMN approval_status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending';

ALTER TABLE knowledge_articles
  MODIFY COLUMN approval_status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending';
