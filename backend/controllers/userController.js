const db = require('../config/database');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, name, email, user_pic, is_admin, is_publisher, is_active, reports_count, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_publisher, is_admin, is_active } = req.body;

        const updates = [];
        const params = [];

        if (is_publisher !== undefined) {
            updates.push('is_publisher = ?');
            params.push(is_publisher);
        }

        if (is_admin !== undefined) {
            updates.push('is_admin = ?');
            params.push(is_admin);
        }

        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'لا توجد تحديثات' });
        }

        params.push(id);

        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
            params
        );

        res.json({ message: 'تم تحديث صلاحيات المستخدم بنجاح' });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query('SELECT is_admin FROM users WHERE user_id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }
        if (rows[0].is_admin) {
            return res.status(400).json({ error: 'لا يمكن حذف حساب مدير' });
        }

        await db.query('DELETE FROM users WHERE user_id = ?', [id]);

        res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};
