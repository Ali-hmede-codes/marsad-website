const db = require('../config/database');
const { isInLebanon, sanitizeInput } = require('../utils/validation');
const { getAddressFromCoordinates } = require('../utils/geocoding');

// ... (existing code)

// Create new report
exports.createReport = async (req, res) => {
    try {
        const { latitude, longitude, category, report_address } = req.body;

        // Validate required fields
        if (!latitude || !longitude || !category) {
            return res.status(400).json({ error: 'الموقع والفئة مطلوبان' });
        }

        // Validate coordinates are in Lebanon
        if (!isInLebanon(parseFloat(latitude), parseFloat(longitude))) {
            return res.status(400).json({ error: 'الموقع يجب أن يكون داخل لبنان' });
        }

        // Auto-detect address if not provided
        let finalAddress = report_address;
        if (!finalAddress) {
            const autoAddress = await getAddressFromCoordinates(latitude, longitude);
            finalAddress = autoAddress || 'موقع غير معروف';
        }

        // Check category exists and is a child category (not parent)
        const [catData] = await db.query('SELECT required_role, parent_id FROM categories WHERE catg_id = ?', [category]);
        if (catData.length === 0) {
            return res.status(400).json({ error: 'الفئة غير موجودة' });
        }

        // Ensure only child categories are used for reports
        if (catData[0].parent_id === null) {
            return res.status(400).json({ error: 'يجب اختيار فئة فرعية وليس فئة رئيسية' });
        }

        const requiredRole = catData[0].required_role;
        if (requiredRole === 'admin' && !req.user.is_admin) {
            return res.status(403).json({ error: 'غير مصرح لك بالنشر في هذه الفئة' });
        }
        if (requiredRole === 'publisher' && !req.user.is_publisher && !req.user.is_admin) {
            return res.status(403).json({ error: 'غير مصرح لك بالنشر في هذه الفئة' });
        }

        // Check for duplicates (Strict Blocking) - within 3km and 1 hour
        // 3000 meters covers a typical village/small city area
        const [duplicates] = await db.query(`
            SELECT rep_id FROM reports 
            WHERE categorie = ? 
            AND ST_Distance_Sphere(geolocation, POINT(?, ?)) < 3000 
            AND date_and_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            AND is_active = TRUE
            LIMIT 1
        `, [category, parseFloat(longitude), parseFloat(latitude)]);

        if (duplicates.length > 0) {
            // Strict blocking: Do not allow new report
            return res.status(400).json({
                error: 'عذراً، يوجد تقرير مشابه في نفس المنطقة (المدينة/القرية) تم تقديمه خلال الساعة الماضية. لا يمكن تقديم تقرير جديد حالياً.',
                is_duplicate: true
            });
        }

        // Create POINT geometry
        const [result] = await db.query(
            `INSERT INTO reports 
            (latitude, longitude, geolocation, categorie, user_reported, report_address, confirmation_count) 
            VALUES (?, ?, POINT(?, ?), ?, ?, ?, 1)`,
            [
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(longitude),
                parseFloat(latitude),
                category,
                req.user.user_id,
                sanitizeInput(finalAddress)
            ]
        );

        // Update user reports count
        await db.query(
            'UPDATE users SET reports_count = reports_count + 1 WHERE user_id = ?',
            [req.user.user_id]
        );

        res.status(201).json({
            message: 'تم إنشاء التقرير بنجاح',
            report_id: result.insertId,
            address: finalAddress
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Update report
exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        // Check if report exists and user owns it (or is admin)
        const [reports] = await db.query(
            'SELECT user_reported FROM reports WHERE rep_id = ?',
            [id]
        );

        if (reports.length === 0) {
            return res.status(404).json({ error: 'التقرير غير موجود' });
        }

        if (reports[0].user_reported !== req.user.user_id && !req.user.is_admin) {
            return res.status(403).json({ error: 'غير مصرح لك بتعديل هذا التقرير' });
        }

        // Update report
        const updates = [];
        const params = [];

        if (is_active !== undefined && req.user.is_admin) {
            updates.push('is_active = ?');
            params.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'لا توجد تحديثات' });
        }

        params.push(id);

        await db.query(
            `UPDATE reports SET ${updates.join(', ')} WHERE rep_id = ?`,
            params
        );

        res.json({ message: 'تم تحديث التقرير بنجاح' });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if report exists and user owns it (or is admin)
        const [reports] = await db.query(
            'SELECT user_reported FROM reports WHERE rep_id = ?',
            [id]
        );

        if (reports.length === 0) {
            return res.status(404).json({ error: 'التقرير غير موجود' });
        }

        if (reports[0].user_reported !== req.user.user_id && !req.user.is_admin) {
            return res.status(403).json({ error: 'غير مصرح لك بحذف هذا التقرير' });
        }

        // Soft delete (set is_active to false)
        await db.query('UPDATE reports SET is_active = FALSE WHERE rep_id = ?', [id]);

        res.json({ message: 'تم حذف التقرير بنجاح' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Get all reports
exports.getAllReports = async (req, res) => {
    try {
        const { category, limit, today, tzOffset } = req.query;
        const offset = tzOffset || '+02:00';
        const sign = offset.startsWith('-') ? -1 : 1;
        const parts = offset.replace('+', '').replace('-', '').split(':');
        const offsetMinutes = sign * ((parseInt(parts[0] || '0', 10) * 60) + parseInt(parts[1] || '0', 10));
        let sql = 'SELECT * FROM report_details WHERE is_active = TRUE';
        const params = [];
        if (today === 'true') {
            sql += ' AND DATE(TIMESTAMPADD(MINUTE, ?, date_and_time)) = DATE(TIMESTAMPADD(MINUTE, ?, UTC_TIMESTAMP()))';
            params.push(offsetMinutes, offsetMinutes);
        }
        if (category) {
            sql += ' AND categorie = ?';
            params.push(parseInt(category));
        }
        sql += ' ORDER BY date_and_time DESC';
        if (limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        const [reports] = await db.query(sql, params);

        res.json(reports);
    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Get single report by ID
exports.getReport = async (req, res) => {
    try {
        const { id } = req.params;

        const [reports] = await db.query(
            'SELECT * FROM report_details WHERE rep_id = ? AND is_active = TRUE',
            [id]
        );

        if (reports.length === 0) {
            return res.status(404).json({ error: 'التقرير غير موجود' });
        }

        res.json(reports[0]);
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

exports.getTodayReports = async (req, res) => {
    try {
        const { category, tzOffset } = req.query;
        const offset = tzOffset || '+02:00';
        const sign = offset.startsWith('-') ? -1 : 1;
        const parts = offset.replace('+', '').replace('-', '').split(':');
        const offsetMinutes = sign * ((parseInt(parts[0] || '0', 10) * 60) + parseInt(parts[1] || '0', 10));
        let sql = 'SELECT * FROM report_details WHERE is_active = TRUE AND DATE(TIMESTAMPADD(MINUTE, ?, date_and_time)) = DATE(TIMESTAMPADD(MINUTE, ?, UTC_TIMESTAMP()))';
        const params = [offsetMinutes, offsetMinutes];
        if (category) {
            sql += ' AND categorie = ?';
            params.push(parseInt(category));
        }
        sql += ' ORDER BY date_and_time DESC';
        const [reports] = await db.query(sql, params);
        res.json(reports);
    } catch (error) {
        console.error('Get today reports error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

exports.getTodayReportsByType = async (req, res) => {
    try {
        const { tzOffset } = req.query;
        const offset = tzOffset || '+02:00';
        const sign = offset.startsWith('-') ? -1 : 1;
        const parts = offset.replace('+', '').replace('-', '').split(':');
        const offsetMinutes = sign * ((parseInt(parts[0] || '0', 10) * 60) + parseInt(parts[1] || '0', 10));
        const [rows] = await db.query(
            `SELECT categorie AS category_id, category_name, COUNT(*) AS count
             FROM report_details
             WHERE is_active = TRUE AND DATE(TIMESTAMPADD(MINUTE, ?, date_and_time)) = DATE(TIMESTAMPADD(MINUTE, ?, UTC_TIMESTAMP()))
             GROUP BY categorie, category_name
             ORDER BY count DESC`,
            [offsetMinutes, offsetMinutes]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get today reports by type error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

exports.getTodayReportsByCity = async (req, res) => {
    try {
        const { tzOffset } = req.query;
        const offset = tzOffset || '+02:00';
        const sign = offset.startsWith('-') ? -1 : 1;
        const parts = offset.replace('+', '').replace('-', '').split(':');
        const offsetMinutes = sign * ((parseInt(parts[0] || '0', 10) * 60) + parseInt(parts[1] || '0', 10));
        const [rows] = await db.query(
            `SELECT TRIM(SUBSTRING_INDEX(report_address, ',', 1)) AS city, COUNT(*) AS count
             FROM report_details
             WHERE is_active = TRUE AND DATE(TIMESTAMPADD(MINUTE, ?, date_and_time)) = DATE(TIMESTAMPADD(MINUTE, ?, UTC_TIMESTAMP()))
             GROUP BY city
             ORDER BY count DESC`,
            [offsetMinutes, offsetMinutes]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get today reports by city error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};
