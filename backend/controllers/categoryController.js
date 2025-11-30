const db = require('../config/database');
const { sanitizeInput } = require('../utils/validation');

// Get all categories (hierarchical)
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY parent_id ASC, catg_name ASC');

        const categoryMap = {};
        const rootCategories = [];

        // First pass: create nodes
        categories.forEach(cat => {
            cat.children = [];
            categoryMap[cat.catg_id] = cat;
        });

        // Second pass: link children
        categories.forEach(cat => {
            if (cat.parent_id) {
                if (categoryMap[cat.parent_id]) {
                    categoryMap[cat.parent_id].children.push(cat);
                }
            } else {
                rootCategories.push(cat);
            }
        });

        res.json(rootCategories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
    try {
        const { catg_name, categorie_desc, catg_color, parent_id, required_role } = req.body;

        if (!catg_name) {
            return res.status(400).json({ error: 'اسم الفئة مطلوب' });
        }

        // Validate Hex Color (6 or 8 digits)
        const color = catg_color || '#000000';
        if (!/^#([0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) {
            return res.status(400).json({ error: 'اللون يجب أن يكون بصيغة Hex (مثال: #FF0000 أو #FF0000FF)' });
        }

        // Get uploaded file path if exists
        const picturePath = req.file ? `/uploads/categories/${req.file.filename}` : null;

        const [result] = await db.query(
            'INSERT INTO categories (catg_name, categorie_desc, catg_color, catg_picture, parent_id, required_role) VALUES (?, ?, ?, ?, ?, ?)',
            [
                sanitizeInput(catg_name),
                sanitizeInput(categorie_desc) || null,
                color,
                picturePath,
                parent_id || null,
                required_role || 'publisher'
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
        const { catg_name, categorie_desc, catg_color, parent_id, required_role } = req.body;

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

        // Update color if provided
        if (catg_color !== undefined) {
            if (!/^#([0-9A-F]{6}|[0-9A-F]{8})$/i.test(catg_color)) {
                return res.status(400).json({ error: 'اللون يجب أن يكون بصيغة Hex (مثال: #FF0000 أو #FF0000FF)' });
            }
            updates.push('catg_color = ?');
            params.push(catg_color);
        }

        // Update picture if new file uploaded
        if (req.file) {
            updates.push('catg_picture = ?');
            params.push(`/uploads/categories/${req.file.filename}`);
        }

        if (parent_id !== undefined) {
            updates.push('parent_id = ?');
            params.push(parent_id || null);
        }

        if (required_role !== undefined) {
            updates.push('required_role = ?');
            params.push(required_role);
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

        // Check if category has children
        const [children] = await db.query(
            'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
            [id]
        );

        if (children[0].count > 0) {
            return res.status(400).json({
                error: 'لا يمكن حذف الفئة لأنها تحتوي على فئات فرعية'
            });
        }

        await db.query('DELETE FROM categories WHERE catg_id = ?', [id]);

        res.json({ message: 'تم حذف الفئة بنجاح' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

