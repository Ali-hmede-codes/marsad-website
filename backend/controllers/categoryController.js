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
        const { catg_name, categorie_desc, catg_color_r, catg_color_g, catg_color_b } = req.body;

        if (!catg_name) {
            return res.status(400).json({ error: 'اسم الفئة مطلوب' });
        }

        // Validate RGB values (0-255)
        const colorR = catg_color_r ? parseInt(catg_color_r) : 100;
        const colorG = catg_color_g ? parseInt(catg_color_g) : 100;
        const colorB = catg_color_b ? parseInt(catg_color_b) : 100;

        if (colorR < 0 || colorR > 255 || colorG < 0 || colorG > 255 || colorB < 0 || colorB > 255) {
            return res.status(400).json({ error: 'قيم الألوان يجب أن تكون بين 0 و 255' });
        }

        // Get uploaded file path if exists
        const picturePath = req.file ? `/uploads/categories/${req.file.filename}` : null;

        const [result] = await db.query(
            'INSERT INTO categories (catg_name, categorie_desc, catg_color_r, catg_color_g, catg_color_b, catg_picture) VALUES (?, ?, ?, ?, ?, ?)',
            [
                sanitizeInput(catg_name),
                sanitizeInput(categorie_desc) || null,
                colorR,
                colorG,
                colorB,
                picturePath
            ]
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
        const { catg_name, categorie_desc, catg_color_r, catg_color_g, catg_color_b } = req.body;

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

        // Update RGB colors if provided
        if (catg_color_r !== undefined) {
            const colorR = parseInt(catg_color_r);
            if (colorR < 0 || colorR > 255) {
                return res.status(400).json({ error: 'قيمة اللون الأحمر يجب أن تكون بين 0 و 255' });
            }
            updates.push('catg_color_r = ?');
            params.push(colorR);
        }

        if (catg_color_g !== undefined) {
            const colorG = parseInt(catg_color_g);
            if (colorG < 0 || colorG > 255) {
                return res.status(400).json({ error: 'قيمة اللون الأخضر يجب أن تكون بين 0 و 255' });
            }
            updates.push('catg_color_g = ?');
            params.push(colorG);
        }

        if (catg_color_b !== undefined) {
            const colorB = parseInt(catg_color_b);
            if (colorB < 0 || colorB > 255) {
                return res.status(400).json({ error: 'قيمة اللون الأزرق يجب أن تكون بين 0 و 255' });
            }
            updates.push('catg_color_b = ?');
            params.push(colorB);
        }

        // Update picture if new file uploaded
        if (req.file) {
            updates.push('catg_picture = ?');
            params.push(`/uploads/categories/${req.file.filename}`);
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
