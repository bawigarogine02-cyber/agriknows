-- User Address and Profile Onboarding Migration

ALTER TABLE users 
  ADD COLUMN address VARCHAR(255) NULL AFTER status;
