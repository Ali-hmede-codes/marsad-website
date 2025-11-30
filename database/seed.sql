-- Seed data for marsad database
-- Categories and default admin user
USE marsad;

-- Insert Main Categories (Parents)
INSERT INTO categories (catg_name, categorie_desc, catg_color, required_role) VALUES
('طائرات', 'تقارير عن نشاط جوي', '#90acc4ff', 'publisher'),
('قصف', 'تقارير عن قصف مدفعي أو صاروخي', '#F44336', 'publisher'),
('اشتباكات', 'تقارير عن اشتباكات برية', '#FF9800', 'publisher'),
('تحركات عسكرية', 'تقارير عن تحركات آليات وجنود', '#795548', 'admin');

-- Insert Subcategories (Children)
-- Planes
SET @planes_id = (SELECT catg_id FROM categories WHERE catg_name = 'طائرات' AND parent_id IS NULL LIMIT 1);

INSERT INTO categories (catg_name, categorie_desc, catg_color, parent_id, required_role) VALUES
('طائرات حربية', 'طائرات مقاتلة نفاثة', '#1976D2', @planes_id, 'publisher'),
('طائرات مسيرة', 'طائرات بدون طيار (درون)', '#0D47A1', @planes_id, 'publisher'),
('طائرات استطلاع', 'طائرات مراقبة', '#64B5F6', @planes_id, 'publisher');

-- Shelling
SET @shelling_id = (SELECT catg_id FROM categories WHERE catg_name = 'قصف' AND parent_id IS NULL LIMIT 1);

INSERT INTO categories (catg_name, categorie_desc, catg_color, parent_id, required_role) VALUES
('قصف مدفعي', 'قذائف مدفعية', '#D32F2F', @shelling_id, 'publisher'),
('صواريخ', 'إطلاق صواريخ', '#C62828', @shelling_id, 'publisher'),
('غارات جوية', 'قصف من الطائرات', '#B71C1C', @shelling_id, 'publisher');

-- Clashes
SET @clashes_id = (SELECT catg_id FROM categories WHERE catg_name = 'اشتباكات' AND parent_id IS NULL LIMIT 1);

INSERT INTO categories (catg_name, categorie_desc, catg_color, parent_id, required_role) VALUES
('اشتباكات خفيفة', 'تبادل إطلاق نار', '#FB8C00', @clashes_id, 'publisher'),
('اشتباكات عنيفة', 'معارك شديدة', '#E65100', @clashes_id, 'publisher');

-- Military Movements
SET @military_id = (SELECT catg_id FROM categories WHERE catg_name = 'تحركات عسكرية' AND parent_id IS NULL LIMIT 1);

INSERT INTO categories (catg_name, categorie_desc, catg_color, parent_id, required_role) VALUES
('آليات عسكرية', 'دبابات ومدرعات', '#6D4C41', @military_id, 'admin'),
('جنود', 'تحركات قوات برية', '#5D4037', @military_id, 'admin');

-- Insert Default Admin User
-- Email: admin@marsad.com
-- Password: admin123
INSERT INTO users (name, email, password, is_admin, is_publisher, is_active, is_verified) VALUES
('المدير', 'admin@marsad.com', '$2a$10$RUJ/CDGFPyjjVhWJNHis4eSkz./Q39xvMMd75VLbb3QGLT4BAkPv2', TRUE, TRUE, TRUE, TRUE);
