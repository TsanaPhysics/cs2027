-- ==============================================================================
-- Schema: MySQL / MariaDB Database for Course 4124941 Computational Science
-- RBRU General Science Education Curriculum 2027
-- Compatible with XAMPP MariaDB & phpMyAdmin
-- Instructor: Asst. Prof. Dr. Chewa Thassana
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `rbru_cs2027_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `rbru_cs2027_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: students
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `student_id` VARCHAR(20) NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)',
  `faculty` VARCHAR(100) DEFAULT 'คณะครุศาสตร์ / คณะวิทยาศาสตร์และเทคโนโลยี',
  `university` VARCHAR(100) DEFAULT 'มหาวิทยาลัยราชภัฏรำไพพรรณี',
  `avatar_color` VARCHAR(20) DEFAULT '#0284c7',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: assignments (Curriculum Weeks 1 - 16)
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `week` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `module_name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `rubric_max_score` DECIMAL(5,2) DEFAULT 20.00,
  `due_date` DATE DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: submissions
DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `submission_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(20) NOT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `week` INT(11) NOT NULL,
  `assignment_title` VARCHAR(255) NOT NULL,
  `work_link` TEXT DEFAULT NULL,
  `decomp_text` LONGTEXT DEFAULT NULL,
  `pattern_text` LONGTEXT DEFAULT NULL,
  `abstr_text` LONGTEXT DEFAULT NULL,
  `algo_text` LONGTEXT DEFAULT NULL,
  `reflection_text` LONGTEXT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'graded',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`submission_id`),
  KEY `idx_submissions_student` (`student_id`),
  KEY `idx_submissions_week` (`week`),
  CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`week`) REFERENCES `assignments` (`week`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: evaluations
DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE `evaluations` (
  `evaluation_id` INT(11) NOT NULL AUTO_INCREMENT,
  `submission_id` VARCHAR(50) NOT NULL UNIQUE,
  `score_decomp` DECIMAL(4,2) NOT NULL,
  `score_pattern` DECIMAL(4,2) NOT NULL,
  `score_abstr` DECIMAL(4,2) NOT NULL,
  `score_algo` DECIMAL(4,2) NOT NULL,
  `total_score` DECIMAL(5,2) NOT NULL,
  `max_score` DECIMAL(5,2) DEFAULT 20.00,
  `grade` VARCHAR(10) NOT NULL,
  `cognitive_level` VARCHAR(50) NOT NULL,
  `strengths_json` LONGTEXT DEFAULT NULL,
  `growth_areas_json` LONGTEXT DEFAULT NULL,
  `personalized_feedback` LONGTEXT DEFAULT NULL,
  `pedagogical_recommendations_json` LONGTEXT DEFAULT NULL,
  `instructor_name` VARCHAR(100) DEFAULT 'ผศ.ดร.ชีวะ ทัศนา (AI Copilot)',
  `evaluated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`evaluation_id`),
  KEY `idx_evaluations_submission` (`submission_id`),
  KEY `idx_evaluations_total_score` (`total_score`),
  CONSTRAINT `fk_evaluations_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: learner_analytics
DROP TABLE IF EXISTS `learner_analytics`;
CREATE TABLE `learner_analytics` (
  `student_id` VARCHAR(20) NOT NULL,
  `submissions_count` INT(11) DEFAULT 0,
  `avg_total_score` DECIMAL(5,2) DEFAULT 0.00,
  `avg_decomp` DECIMAL(4,2) DEFAULT 0.00,
  `avg_pattern` DECIMAL(4,2) DEFAULT 0.00,
  `avg_abstr` DECIMAL(4,2) DEFAULT 0.00,
  `avg_algo` DECIMAL(4,2) DEFAULT 0.00,
  `primary_cognitive_level` VARCHAR(50) DEFAULT 'Remembering',
  `last_active_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  CONSTRAINT `fk_analytics_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

