-- ============================================
-- typeCode Database Schema
-- Run this to create all tables in MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS typecode_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE typecode_db;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar_url VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    preferred_mode ENUM('normal', 'programmer') DEFAULT 'normal',
    preferred_duration INT DEFAULT 60,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- 2. Text Content
CREATE TABLE IF NOT EXISTS text_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    word_count INT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB;

-- 3. Code Snippets
CREATE TABLE IF NOT EXISTS code_snippets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    language ENUM('python', 'javascript', 'java', 'c', 'cpp', 'html', 'css', 'sql') NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    description TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_language (language),
    INDEX idx_lang_diff (language, difficulty)
) ENGINE=InnoDB;

-- 4. Typing Results
CREATE TABLE IF NOT EXISTS typing_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_mode ENUM('normal', 'programmer') NOT NULL,
    content_id INT NOT NULL,
    content_type ENUM('text', 'code') NOT NULL,
    duration_seconds INT NOT NULL,
    wpm DECIMAL(6,2) NOT NULL,
    cpm DECIMAL(8,2) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    total_chars INT NOT NULL,
    correct_chars INT NOT NULL,
    incorrect_chars INT NOT NULL,
    consistency DECIMAL(5,2) DEFAULT 0,
    language VARCHAR(20) DEFAULT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_mode (user_id, test_mode),
    INDEX idx_user_date (user_id, completed_at),
    INDEX idx_leaderboard (test_mode, duration_seconds, wpm DESC)
) ENGINE=InnoDB;

-- 5. Key Errors (per-user weak key tracking)
CREATE TABLE IF NOT EXISTS key_errors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    key_char VARCHAR(10) NOT NULL,
    error_count INT DEFAULT 0,
    total_attempts INT DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_key (user_id, key_char),
    INDEX idx_user_errors (user_id, error_rate DESC)
) ENGINE=InnoDB;

-- 6. User Progress (aggregated stats)
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_mode ENUM('normal', 'programmer') NOT NULL,
    avg_wpm DECIMAL(6,2) DEFAULT 0,
    avg_accuracy DECIMAL(5,2) DEFAULT 0,
    tests_completed INT DEFAULT 0,
    best_wpm DECIMAL(6,2) DEFAULT 0,
    total_time_seconds INT DEFAULT 0,
    most_errored_keys VARCHAR(100) DEFAULT NULL,
    last_test_date DATETIME DEFAULT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_mode (user_id, test_mode)
) ENGINE=InnoDB;

-- 7. Token Blocklist (JWT logout)
CREATE TABLE IF NOT EXISTS token_blocklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jti VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jti (jti),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;
