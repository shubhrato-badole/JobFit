-- ─────────────────────────────────────────────
-- JobFit Database Schema
-- Run this file once to create all tables
-- Command: psql -U postgres -d jobfit -f schema.sql
-- ─────────────────────────────────────────────


-- ── Enable UUID generation ───────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────
-- USERS
-- Stores all registered users
-- resume_text → extracted text from uploaded PDF
-- role        → 'user' or 'admin'
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password          VARCHAR(255) NOT NULL,
  resume_text       TEXT,
  resume_uploaded_at TIMESTAMP,
  role              VARCHAR(50)  NOT NULL DEFAULT 'user',
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  refreshtoken     TEXT,
  login_attempts   INT DEFAULT 0,
  blocked_until TIMESTAMP
);


-- ─────────────────────────────────────────────
-- APPLICATIONS
-- Every job a user has analyzed and saved
-- status → APPLIED, INTERVIEW, OFFER, REJECTED
-- missing_skills, strengths → JSON arrays from AI
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company        VARCHAR(255) NOT NULL,
  role           VARCHAR(255) NOT NULL,
  job_desc       TEXT         NOT NULL,
  match_score    INTEGER      CHECK (match_score >= 0 AND match_score <= 100),
  missing_skills JSONB,
  strengths      JSONB,
  suggestions    TEXT,
  status         VARCHAR(50)  NOT NULL DEFAULT 'APPLIED',
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- SAVED JOBS
-- Jobs user bookmarked from search
-- without analyzing yet
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  company    VARCHAR(255) NOT NULL,
  location   VARCHAR(255),
  salary     VARCHAR(255),
  job_desc   TEXT,
  source_url TEXT,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- INDEXES
-- Speed up the most common queries
-- ─────────────────────────────────────────────

-- Applications: most queries filter by user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id
  ON applications(user_id);

-- Applications: dashboard groups by status
CREATE INDEX IF NOT EXISTS idx_applications_status
  ON applications(user_id, status);

-- Saved jobs: filter by user_id
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id
  ON saved_jobs(user_id);

-- Users: login always queries by email
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);


-- ─────────────────────────────────────────────
-- AUTO UPDATE updated_at ON CHANGE
-- Postgres doesn't do this automatically
-- This trigger fires before every UPDATE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trigger_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();