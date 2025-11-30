const db = require('../config/database');
const { isInLebanon, sanitizeInput } = require('../utils/validation');
const { getAddressFromCoordinates } = require('../utils/geocoding');

// ... (existing code)

// Create new report
exports.createReport = async (req, res) => {
    try {
        const { latitude, longitude, category, description, report_address } = req.body;

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

        // Check category permissions
        const [catData] = await db.query('SELECT required_role FROM categories WHERE catg_id = ?', [category]);
        if (catData.length === 0) {
            return res.status(400).json({ error: 'الفئة غير موجودة' });
        }

        const requiredRole = catData[0].required_role;
        if (requiredRole === 'admin' && !req.user.is_admin) {
            return res.status(403).json({ error: 'غير مصرح لك بالنشر في هذه الفئة' });
        }
        if (requiredRole === 'publisher' && !req.user.is_publisher && !req.user.is_admin) {
            return res.status(403).json({ error: 'غير مصرح لك بالنشر في هذه الفئة' });
        }

        // Check for duplicates (Clustering) - within 1km and 1 hour
        const [duplicates] = await db.query(`
            SELECT rep_id FROM reports 
            WHERE categorie = ? 
            AND ST_Distance_Sphere(geolocation, POINT(?, ?)) < 1000 
            AND date_and_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            AND is_active = TRUE
            ORDER BY date_and_time DESC
            LIMIT 1
        `, [category, parseFloat(longitude), parseFloat(latitude)]);

        if (duplicates.length > 0) {
            // Increment count on existing report
            await db.query(
                'UPDATE reports SET confirmation_count = confirmation_count + 1, last_confirmed_at = NOW() WHERE rep_id = ?',
                [duplicates[0].rep_id]
            );

            return res.status(200).json({
                message: 'تم دمج التقرير مع تقرير موجود مسبقاً في نفس المنطقة',
                report_id: duplicates[0].rep_id,
                is_duplicate: true
            });
        }

        // Create POINT geometry
        const [result] = await db.query(
            `INSERT INTO reports 
            (latitude, longitude, geolocation, categorie, user_reported, description, report_address, confirmation_count) 
            VALUES (?, ?, POINT(?, ?), ?, ?, ?, ?, 1)`,
            [
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(longitude),
                parseFloat(latitude),
                category,
                req.user.user_id,
                sanitizeInput(description) || null,
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
        const { description, is_active } = req.body;

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

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(sanitizeInput(description));
        }

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

// Get reports by location
exports.getReportsByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;

        const [reports] = await db.query(
            'SELECT * FROM report_details WHERE is_active = TRUE ORDER BY date_and_time DESC',
            []
        );

        res.json(reports);
    } catch (error) {
        console.error('Get reports by location error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};
