-- Store all crop catalog fields submitted by the application.
ALTER TABLE crops
  ADD COLUMN category VARCHAR(100) NULL,
  ADD COLUMN type VARCHAR(120) NULL,
  ADD COLUMN stage VARCHAR(120) NULL,
  ADD COLUMN detail TEXT NULL,
  ADD COLUMN soil VARCHAR(255) NULL;

ALTER TABLE knowledge_articles
  ADD COLUMN evidence_note TEXT NULL,
  ADD COLUMN source_url VARCHAR(1000) NULL;

ALTER TABLE fields
  ADD COLUMN crop_name VARCHAR(120) NULL;

-- Locations can represent a named place even when coordinates are unavailable.
ALTER TABLE locations
  MODIFY COLUMN latitude DECIMAL(9,6) NULL,
  MODIFY COLUMN longitude DECIMAL(9,6) NULL;
