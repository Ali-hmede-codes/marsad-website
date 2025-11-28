-- Update seed.sql with proper admin password hash
-- Run generate-password.js first to get the hash
USE lebanon_reports;

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

-- Insert Lebanon Locations (Major Cities and Regions)
INSERT INTO location (location_name, reports_categorie) VALUES
('بيروت', 'عاصمة'),
('طرابلس', 'شمال'),
('صيدا', 'جنوب'),
('صور', 'جنوب'),
('النبطية', 'جنوب'),
('بعلبك', 'بقاع'),
('زحلة', 'بقاع'),
('جبيل', 'جبل لبنان'),
('جونيه', 'جبل لبنان'),
('عاليه', 'جبل لبنان'),
('بنت جبيل', 'جنوب'),
('مرجعيون', 'جنوب'),
('حاصبيا', 'جنوب'),
('راشيا', 'بقاع'),
('الهرمل', 'بقاع'),
('عكار', 'شمال'),
('البترون', 'شمال'),
('الكورة', 'شمال'),
('المتن', 'جبل لبنان'),
('الشوف', 'جبل لبنان');

-- Insert Default Admin User
-- Password: admin123
-- Run: node generate-password.js
-- Then copy the hash and replace HASH_HERE below
INSERT INTO users (name, email, password, is_admin, is_publisher, is_active) VALUES
('المدير', 'admin@lebanon-reports.com', '$2a$10$YourHashedPasswordHere', TRUE, TRUE, TRUE);

-- Note: After running this file, you MUST update the admin password hash
-- Run: node generate-password.js
-- Then execute the UPDATE query it provides
