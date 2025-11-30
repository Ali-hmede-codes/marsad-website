-- Lebanon Breach Reporting System Database Schema
-- Drop database if exists and create new
-- DROP DATABASE IF EXISTS marsad;  -- Disabled in phpMyAdmin/web interfaces
CREATE DATABASE IF NOT EXISTS marsad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marsad;

-- Users Table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_pic VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reports_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_publisher BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    token_expires DATETIME,
    INDEX idx_email (email),
    INDEX idx_is_publisher (is_publisher),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE categories (
    catg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    catg_name VARCHAR(255) NOT NULL,
    categorie_desc TEXT,
    catg_color VARCHAR(9) DEFAULT '#000000',
    catg_picture VARCHAR(255),
    parent_id BIGINT DEFAULT NULL,
    required_role ENUM('publisher', 'admin') DEFAULT 'publisher',
    INDEX idx_catg_name (catg_name),
    FOREIGN KEY (parent_id) REFERENCES categories(catg_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports Table
CREATE TABLE reports (
    rep_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_address VARCHAR(255) NOT NULL,
    date_and_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    geolocation POINT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    categorie BIGINT NOT NULL,
    user_reported BIGINT NOT NULL,
    confirmation_count INT DEFAULT 1,
    last_confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie) REFERENCES categories(catg_id) ON DELETE CASCADE,
    FOREIGN KEY (user_reported) REFERENCES users(user_id) ON DELETE CASCADE,
    SPATIAL INDEX idx_geolocation (geolocation),
    INDEX idx_date (date_and_time),
    INDEX idx_categorie (categorie),
    INDEX idx_user (user_reported),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a view for easy report retrieval with user and category info
CREATE VIEW report_details AS
SELECT 
    r.rep_id,
    r.report_address,
    r.date_and_time,
    r.latitude,
    r.longitude,
    r.is_active,
    r.categorie,
    r.confirmation_count,
    r.last_confirmed_at,
    c.catg_name AS category_name,
    c.categorie_desc AS category_description,
    c.catg_color AS category_color,
    c.catg_picture AS category_picture,
    c.parent_id AS category_parent_id,
    c.required_role AS category_required_role,
    u.name AS reporter_name,
    u.user_pic AS reporter_pic
FROM reports r
JOIN categories c ON r.categorie = c.catg_id
JOIN users u ON r.user_reported = u.user_id;

