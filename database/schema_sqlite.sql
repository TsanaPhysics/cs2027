-- ==============================================================================
-- Schema: SQLite3 Database for Course 4124941 Computational Science
-- RBRU General Science Education Curriculum 2027
-- Instructor: Asst. Prof. Dr. Chewa Thassana
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Table: students
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(20) PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  department VARCHAR(100) DEFAULT 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)',
  faculty VARCHAR(100) DEFAULT 'คณะครุศาสตร์ / คณะวิทยาศาสตร์และเทคโนโลยี',
  university VARCHAR(100) DEFAULT 'มหาวิทยาลัยราชภัฏรำไพพรรณี',
  avatar_color VARCHAR(20) DEFAULT '#0284c7',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: assignments (Curriculum Weeks 1 - 16)
CREATE TABLE IF NOT EXISTS assignments (
  week INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  description TEXT,
  rubric_max_score DECIMAL(5,2) DEFAULT 20.00,
  due_date DATE,
  is_active INTEGER DEFAULT 1
);

-- 3. Table: submissions
CREATE TABLE IF NOT EXISTS submissions (
  submission_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  week INTEGER NOT NULL,
  assignment_title VARCHAR(255) NOT NULL,
  work_link TEXT,
  decomp_text TEXT,
  pattern_text TEXT,
  abstr_text TEXT,
  algo_text TEXT,
  reflection_text TEXT,
  status VARCHAR(20) DEFAULT 'graded',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (week) REFERENCES assignments(week) ON DELETE CASCADE
);

-- 4. Table: evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id VARCHAR(50) NOT NULL UNIQUE,
  score_decomp DECIMAL(4,2) NOT NULL,
  score_pattern DECIMAL(4,2) NOT NULL,
  score_abstr DECIMAL(4,2) NOT NULL,
  score_algo DECIMAL(4,2) NOT NULL,
  total_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) DEFAULT 20.00,
  grade VARCHAR(10) NOT NULL,
  cognitive_level VARCHAR(50) NOT NULL,
  strengths_json TEXT,
  growth_areas_json TEXT,
  personalized_feedback TEXT,
  pedagogical_recommendations_json TEXT,
  instructor_name VARCHAR(100) DEFAULT 'ผศ.ดร.ชีวะ ทัศนา (AI Copilot)',
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- 5. Table: learner_analytics
CREATE TABLE IF NOT EXISTS learner_analytics (
  student_id VARCHAR(20) PRIMARY KEY,
  submissions_count INTEGER DEFAULT 0,
  avg_total_score DECIMAL(5,2) DEFAULT 0.00,
  avg_decomp DECIMAL(4,2) DEFAULT 0.00,
  avg_pattern DECIMAL(4,2) DEFAULT 0.00,
  avg_abstr DECIMAL(4,2) DEFAULT 0.00,
  avg_algo DECIMAL(4,2) DEFAULT 0.00,
  primary_cognitive_level VARCHAR(50) DEFAULT 'Remembering',
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_week ON submissions(week);
CREATE INDEX IF NOT EXISTS idx_evaluations_submission ON evaluations(submission_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_total_score ON evaluations(total_score);

