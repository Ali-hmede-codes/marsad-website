-- Update seed.sql with proper admin password hash
-- Run generate-password.js first to get the hash
USE lebanon_reports;

-- Insert Default Categories (in Arabic)
INSERT INTO categories (catg_name, categorie_desc) VALUES
('طائرات مسيرة', 'تقارير عن طائرات مسيرة في المجال الجوي اللبناني'),
('طائرات حربية', 'تقارير عن طائرات حربية في المجال الجوي اللبناني'),
('صواريخ', 'تقارير عن إطلاق صواريخ'),
('انفجارات', 'تقارير عن انفجارات وتفجيرات'),
('اشتباكات مسلحة', 'تقارير عن اشتباكات مسلحة'),
('قصف مدفعي', 'تقارير عن قصف مدفعي'),
('حركة عسكرية', 'تقارير عن حركة عسكرية غير عادية'),
('أخرى', 'تقارير أخرى');

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
