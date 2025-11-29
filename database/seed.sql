-- Seed data for marsad database
-- Categories and default admin user
USE marsad;

-- Insert Default Categories (in Arabic)
INSERT INTO categories (catg_name, categorie_desc, catg_color_r, catg_color_g, catg_color_b, catg_picture) VALUES
('طائرات مسيرة', 'تقارير عن طائرات مسيرة في المجال الجوي اللبناني', 59, 130, 246, NULL),
('طائرات حربية', 'تقارير عن طائرات حربية في المجال الجوي اللبناني', 71, 85, 105, NULL),
('صواريخ', 'تقارير عن إطلاق صواريخ', 239, 68, 68, NULL),
('انفجارات', 'تقارير عن انفجارات وتفجيرات', 251, 146, 60, NULL),
('اشتباكات مسلحة', 'تقارير عن اشتباكات مسلحة', 168, 85, 247, NULL),
('قصف مدفعي', 'تقارير عن قصف مدفعي', 161, 98, 7, NULL),
('حركة عسكرية', 'تقارير عن حركة عسكرية غير عادية', 34, 197, 94, NULL),
('أخرى', 'تقارير أخرى', 148, 163, 184, NULL);

-- Lebanon locations are loaded from lebanon_locations.sql
-- Run that file separately to populate the locations table

-- Insert Default Admin User
-- Email: admin@marsad.com
-- Password: admin123
INSERT INTO users (name, email, password, is_admin, is_publisher, is_active) VALUES
('المدير', 'admin@marsad.com', '$2a$10$RUJ/CDGFPyjjVhWJNHis4eSkz./Q39xvMMd75VLbb3QGLT4BAkPv2', TRUE, TRUE, TRUE);
