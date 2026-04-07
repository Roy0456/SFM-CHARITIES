-- Database schema for SFM Charities
-- Operational model:
-- Proposal -> Services
-- Participant -> Case -> Case Services

BEGIN;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE participants (
  participant_id SERIAL PRIMARY KEY,
  first_name VARCHAR(150) NOT NULL,
  middle_name VARCHAR(150),
  last_name VARCHAR(150) NOT NULL,
  full_legal_name VARCHAR(300),
  birth_date DATE,
  gender VARCHAR(50),
  ethnicity VARCHAR(100),
  race VARCHAR(100),
  marital_status VARCHAR(100),
  nationality VARCHAR(100),
  preferred_language VARCHAR(100),
  social_security VARCHAR(50),
  license_id VARCHAR(100),
  passport_id VARCHAR(100),
  phone VARCHAR(50),
  mobile_phone VARCHAR(50),
  email VARCHAR(254),
  address_line_1 VARCHAR(300),
  city VARCHAR(150),
  state VARCHAR(100),
  postal_code VARCHAR(30),
  insurance_type VARCHAR(150),
  employment_status VARCHAR(150),
  income_source VARCHAR(200),
  annual_income NUMERIC(14, 2) CHECK (annual_income IS NULL OR annual_income >= 0),
  family_composition TEXT,
  housing_type VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  role VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proposals (
  proposal_id SERIAL PRIMARY KEY,
  proposal_name VARCHAR(250) NOT NULL,
  proposal_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  funder VARCHAR(250),
  start_date DATE,
  end_date DATE,
  status VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_proposals_date_range CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE TABLE services (
  service_id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL,
  service_name VARCHAR(250) NOT NULL,
  service_code VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_services_proposal FOREIGN KEY (proposal_id)
    REFERENCES proposals (proposal_id) ON DELETE CASCADE,
  CONSTRAINT uq_services_proposal_code UNIQUE (proposal_id, service_code)
);

CREATE TABLE cases (
  case_id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL,
  case_number VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'pending', 'closed')),
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  case_manager_id INTEGER,
  intake_date DATE,
  close_date DATE,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_cases_participant FOREIGN KEY (participant_id)
    REFERENCES participants (participant_id) ON DELETE CASCADE,
  CONSTRAINT fk_cases_manager FOREIGN KEY (case_manager_id)
    REFERENCES users (user_id) ON DELETE SET NULL,
  CONSTRAINT chk_cases_date_range CHECK (
    close_date IS NULL OR intake_date IS NULL OR close_date >= intake_date
  )
);

CREATE TABLE case_services (
  case_service_id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'referred')),
  date_assigned DATE,
  date_started DATE,
  date_completed DATE,
  priority INTEGER,
  outcome TEXT,
  notes TEXT,
  created_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_case_services_case FOREIGN KEY (case_id)
    REFERENCES cases (case_id) ON DELETE CASCADE,
  CONSTRAINT fk_case_services_service FOREIGN KEY (service_id)
    REFERENCES services (service_id) ON DELETE CASCADE,
  CONSTRAINT fk_case_services_user FOREIGN KEY (created_by)
    REFERENCES users (user_id) ON DELETE SET NULL,
  CONSTRAINT uq_case_services_case_service UNIQUE (case_id, service_id),
  CONSTRAINT chk_case_services_started_after_assigned CHECK (
    date_started IS NULL OR date_assigned IS NULL OR date_started >= date_assigned
  ),
  CONSTRAINT chk_case_services_completed_after_assigned CHECK (
    date_completed IS NULL OR date_assigned IS NULL OR date_completed >= date_assigned
  ),
  CONSTRAINT chk_case_services_completed_after_started CHECK (
    date_completed IS NULL OR date_started IS NULL OR date_completed >= date_started
  )
);

CREATE TABLE notes (
  note_id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL,
  user_id INTEGER,
  note_type VARCHAR(100),
  content TEXT NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notes_case FOREIGN KEY (case_id)
    REFERENCES cases (case_id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE SET NULL
);

CREATE TABLE documents (
  document_id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL,
  uploaded_by INTEGER,
  document_type VARCHAR(150),
  file_name VARCHAR(300) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  mime_type VARCHAR(150),
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_documents_case FOREIGN KEY (case_id)
    REFERENCES cases (case_id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_user FOREIGN KEY (uploaded_by)
    REFERENCES users (user_id) ON DELETE SET NULL
);

CREATE TABLE case_history (
  history_id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL,
  user_id INTEGER,
  action_type VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_history_case FOREIGN KEY (case_id)
    REFERENCES cases (case_id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE SET NULL
);

CREATE TABLE reports (
  report_id SERIAL PRIMARY KEY,
  report_name VARCHAR(250) NOT NULL,
  report_type VARCHAR(150),
  filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_path VARCHAR(1000),
  generated_by INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_reports_user FOREIGN KEY (generated_by)
    REFERENCES users (user_id) ON DELETE SET NULL
);

CREATE TRIGGER trg_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_case_services_updated_at
  BEFORE UPDATE ON case_services
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Recommended indexes for case-based workflows and reporting
CREATE INDEX idx_participants_last_name_first_name ON participants (last_name, first_name);
CREATE INDEX idx_cases_participant_id ON cases (participant_id);
CREATE INDEX idx_cases_status ON cases (status);
CREATE INDEX idx_cases_case_manager_id ON cases (case_manager_id);
CREATE INDEX idx_case_services_case_id ON case_services (case_id);
CREATE INDEX idx_case_services_service_id ON case_services (service_id);
CREATE INDEX idx_case_services_status ON case_services (status);
CREATE INDEX idx_case_services_case_status ON case_services (case_id, status);
CREATE INDEX idx_case_services_service_status ON case_services (service_id, status);
CREATE INDEX idx_services_proposal_id ON services (proposal_id);
CREATE INDEX idx_notes_case_created_at ON notes (case_id, created_at DESC);
CREATE INDEX idx_documents_case_created_at ON documents (case_id, created_at DESC);
CREATE INDEX idx_history_case_created_at ON case_history (case_id, created_at DESC);
CREATE INDEX idx_reports_generated_by ON reports (generated_by);

COMMIT;
