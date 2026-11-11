ALTER TABLE pests_diseases
  ADD COLUMN author_id CHAR(36) NULL AFTER id,
  ADD COLUMN approval_status ENUM('pending', 'approved') NULL AFTER author_id;

UPDATE pests_diseases
SET approval_status = 'approved';

ALTER TABLE pests_diseases
  MODIFY COLUMN approval_status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  ADD CONSTRAINT fk_pests_diseases_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE knowledge_articles
  ADD COLUMN approval_status ENUM('pending', 'approved') NULL AFTER author_id;

UPDATE knowledge_articles
SET approval_status = 'approved';

ALTER TABLE knowledge_articles
  MODIFY COLUMN approval_status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending';
