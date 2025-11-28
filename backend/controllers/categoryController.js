const db = require('../config/database');
const { sanitizeInput } = require('../utils/validation');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY catg_name');
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
    try {
        const { catg_name, categorie_desc } = req.body;

        if (!catg_name) {
            return res.status(400).json({ error: 'اسم الفئة مطلوب' });
        }

        const [result] = await db.query(
            'INSERT INTO categories (catg_name, categorie_desc) VALUES (?, ?)',
            [sanitizeInput(catg_name), sanitizeInput(categorie_desc) || null]
        );

        res.status(201).json({
            message: 'تم إنشاء الفئة بنجاح',
            category_id: result.insertId
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { catg_name, categorie_desc } = req.body;

        const updates = [];
        const params = [];

        if (catg_name) {
            updates.push('catg_name = ?');
            params.push(sanitizeInput(catg_name));
        }

        if (categorie_desc !== undefined) {
            updates.push('categorie_desc = ?');
            params.push(sanitizeInput(categorie_desc));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'لا توجد تحديثات' });
        }

        params.push(id);

        await db.query(
            `UPDATE categories SET ${updates.join(', ')} WHERE catg_id = ?`,
            params
        );

        res.json({ message: 'تم تحديث الفئة بنجاح' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has reports
        const [reports] = await db.query(
            'SELECT COUNT(*) as count FROM reports WHERE categorie = ?',
            [id]
        );

        if (reports[0].count > 0) {
            return res.status(400).json({
                error: 'لا يمكن حذف الفئة لأنها تحتوي على تقارير'
            });
        }

        await db.query('DELETE FROM categories WHERE catg_id = ?', [id]);

        res.json({ message: 'تم حذف الفئة بنجاح' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};
