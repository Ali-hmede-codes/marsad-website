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
    INDEX idx_email (email),
    INDEX idx_is_publisher (is_publisher),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE categories (
    catg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    catg_name VARCHAR(255) NOT NULL,
    categorie_desc TEXT,
    catg_color_r TINYINT UNSIGNED DEFAULT 100,
    catg_color_g TINYINT UNSIGNED DEFAULT 100,
    catg_color_b TINYINT UNSIGNED DEFAULT 100,
    catg_picture VARCHAR(255),
    INDEX idx_catg_name (catg_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations Table (Lebanon governorates, districts, villages)
CREATE TABLE locations (
    loc_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loc_name VARCHAR(255) NOT NULL,
    loc_type ENUM('governorate', 'district', 'village') NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    INDEX idx_loc_name (loc_name),
    INDEX idx_loc_type (loc_type),
    INDEX idx_parent_id (parent_id),
    FOREIGN KEY (parent_id) REFERENCES locations(loc_id) ON DELETE CASCADE
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
    description TEXT,
    image_url VARCHAR(255),
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
    r.description,
    r.image_url,
    r.is_active,
    r.categorie,
    c.catg_name AS category_name,
    c.categorie_desc AS category_description,
    c.catg_color_r AS category_color_r,
    c.catg_color_g AS category_color_g,
    c.catg_color_b AS category_color_b,
    c.catg_picture AS category_picture,
    u.name AS reporter_name,
    u.user_pic AS reporter_pic
FROM reports r
JOIN categories c ON r.categorie = c.catg_id
JOIN users u ON r.user_reported = u.user_id;
