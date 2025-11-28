-- Lebanon Locations Data
-- This file contains all governorates, districts, and major villages in Lebanon

-- Insert Governorates (Mohafazat)
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Beirut Governorate
('بيروت', 'governorate', NULL),

-- Mount Lebanon Governorate
('جبل لبنان', 'governorate', NULL),

-- North Governorate
('الشمال', 'governorate', NULL),

-- South Governorate
('الجنوب', 'governorate', NULL),

-- Nabatieh Governorate
('النبطية', 'governorate', NULL),

-- Beqaa Governorate
('البقاع', 'governorate', NULL),

-- Baalbek-Hermel Governorate
('بعلبك-الهرمل', 'governorate', NULL),

-- Akkar Governorate
('عكار', 'governorate', NULL);

-- Insert Districts (Aqdiya) and Major Cities/Villages

-- BEIRUT GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
('بيروت', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'بيروت' AND loc_type = 'governorate'));

-- MOUNT LEBANON GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Baabda District
('بعبدا', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'جبل لبنان' AND loc_type = 'governorate')),
('حازمية', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بعبدا' AND loc_type = 'district')),
('الحدث', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بعبدا' AND loc_type = 'district')),
('الشويفات', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بعبدا' AND loc_type = 'district')),

-- Aley District
('عاليه', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'جبل لبنان' AND loc_type = 'governorate')),
('عاليه', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'عاليه' AND loc_type = 'district')),
('بحمدون', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'عاليه' AND loc_type = 'district')),
('صوفر', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'عاليه' AND loc_type = 'district')),

-- Chouf District
('الشوف', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'جبل لبنان' AND loc_type = 'governorate')),
('بعقلين', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الشوف' AND loc_type = 'district')),
('دير القمر', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الشوف' AND loc_type = 'district')),
('بيت الدين', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الشوف' AND loc_type = 'district')),

-- Keserwan District
('كسروان', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'جبل لبنان' AND loc_type = 'governorate')),
('جونيه', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'كسروان' AND loc_type = 'district')),
('جبيل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'كسروان' AND loc_type = 'district')),
('فاريا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'كسروان' AND loc_type = 'district')),

-- Matn District
('المتن', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'جبل لبنان' AND loc_type = 'governorate')),
('جل الديب', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'المتن' AND loc_type = 'district')),
('برج حمود', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'المتن' AND loc_type = 'district')),
('بيت مري', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'المتن' AND loc_type = 'district')),
('بكفيا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'المتن' AND loc_type = 'district')),

-- Jbeil District
('جبيل', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'جبل لبنان' AND loc_type = 'governorate')),
('جبيل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'جبيل' AND loc_type = 'district')),
('عمشيت', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'جبيل' AND loc_type = 'district'));

-- NORTH GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Tripoli District
('طرابلس', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الشمال' AND loc_type = 'governorate')),
('طرابلس', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'طرابلس' AND loc_type = 'district')),
('الميناء', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'طرابلس' AND loc_type = 'district')),

-- Koura District
('الكورة', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الشمال' AND loc_type = 'governorate')),
('أميون', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الكورة' AND loc_type = 'district')),
('كفرحزير', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الكورة' AND loc_type = 'district')),

-- Zgharta District
('زغرتا', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الشمال' AND loc_type = 'governorate')),
('زغرتا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'زغرتا' AND loc_type = 'district')),
('إهدن', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'زغرتا' AND loc_type = 'district')),

-- Bsharri District
('بشري', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الشمال' AND loc_type = 'governorate')),
('بشري', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بشري' AND loc_type = 'district')),
('الأرز', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بشري' AND loc_type = 'district')),

-- Batroun District
('البترون', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الشمال' AND loc_type = 'governorate')),
('البترون', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'البترون' AND loc_type = 'district')),
('جبيل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'البترون' AND loc_type = 'district')),

-- Minieh-Danniyeh District
('المنية-الضنية', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الشمال' AND loc_type = 'governorate')),
('المنية', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'المنية-الضنية' AND loc_type = 'district')),
('سير الضنية', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'المنية-الضنية' AND loc_type = 'district'));

-- SOUTH GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Sidon District
('صيدا', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الجنوب' AND loc_type = 'governorate')),
('صيدا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'صيدا' AND loc_type = 'district')),
('عبرا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'صيدا' AND loc_type = 'district')),
('مغدوشة', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'صيدا' AND loc_type = 'district')),

-- Tyre District
('صور', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الجنوب' AND loc_type = 'governorate')),
('صور', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'صور' AND loc_type = 'district')),
('قانا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'صور' AND loc_type = 'district')),
('بنت جبيل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'صور' AND loc_type = 'district')),

-- Jezzine District
('جزين', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'الجنوب' AND loc_type = 'governorate')),
('جزين', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'جزين' AND loc_type = 'district'));

-- NABATIEH GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Nabatieh District
('النبطية', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'النبطية' AND loc_type = 'governorate')),
('النبطية', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'النبطية' AND loc_type = 'district')),
('حبوش', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'النبطية' AND loc_type = 'district')),

-- Marjeyoun District
('مرجعيون', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'النبطية' AND loc_type = 'governorate')),
('مرجعيون', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'مرجعيون' AND loc_type = 'district')),
('الخيام', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'مرجعيون' AND loc_type = 'district')),

-- Hasbaya District
('حاصبيا', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'النبطية' AND loc_type = 'governorate')),
('حاصبيا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'حاصبيا' AND loc_type = 'district')),
('راشيا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'حاصبيا' AND loc_type = 'district')),

-- Bint Jbeil District
('بنت جبيل', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'النبطية' AND loc_type = 'governorate')),
('بنت جبيل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بنت جبيل' AND loc_type = 'district')),
('عيترون', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بنت جبيل' AND loc_type = 'district'));

-- BEQAA GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Zahle District
('زحلة', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'البقاع' AND loc_type = 'governorate')),
('زحلة', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'زحلة' AND loc_type = 'district')),
('المعلقة', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'زحلة' AND loc_type = 'district')),

-- West Beqaa District
('البقاع الغربي', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'البقاع' AND loc_type = 'governorate')),
('جب جنين', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'البقاع الغربي' AND loc_type = 'district')),
('سعدنايل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'البقاع الغربي' AND loc_type = 'district')),

-- Rashaya District
('راشيا', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'البقاع' AND loc_type = 'governorate')),
('راشيا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'راشيا' AND loc_type = 'district'));

-- BAALBEK-HERMEL GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Baalbek District
('بعلبك', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'بعلبك-الهرمل' AND loc_type = 'governorate')),
('بعلبك', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بعلبك' AND loc_type = 'district')),
('دورس', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'بعلبك' AND loc_type = 'district')),

-- Hermel District
('الهرمل', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'بعلبك-الهرمل' AND loc_type = 'governorate')),
('الهرمل', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الهرمل' AND loc_type = 'district')),
('القاع', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'الهرمل' AND loc_type = 'district'));

-- AKKAR GOVERNORATE
INSERT INTO locations (loc_name, loc_type, parent_id) VALUES
-- Akkar District
('عكار', 'district', (SELECT loc_id FROM locations WHERE loc_name = 'عكار' AND loc_type = 'governorate')),
('حلبا', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'عكار' AND loc_type = 'district')),
('القبيات', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'عكار' AND loc_type = 'district')),
('عكار العتيقة', 'village', (SELECT loc_id FROM locations WHERE loc_name = 'عكار' AND loc_type = 'district'));
