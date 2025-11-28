const db = require('../config/database');

// Get all locations with hierarchy
exports.getAllLocations = async (req, res) => {
    try {
        const [locations] = await db.query(`
            SELECT 
                loc_id,
                loc_name,
                loc_type,
                parent_id
            FROM locations
            ORDER BY 
                CASE loc_type
                    WHEN 'governorate' THEN 1
                    WHEN 'district' THEN 2
                    WHEN 'village' THEN 3
                END,
                loc_name
        `);

        res.json(locations);
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Get locations by type
exports.getLocationsByType = async (req, res) => {
    try {
        const { type } = req.params;

        const [locations] = await db.query(
            'SELECT loc_id, loc_name, parent_id FROM locations WHERE loc_type = ? ORDER BY loc_name',
            [type]
        );

        res.json(locations);
    } catch (error) {
        console.error('Get locations by type error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Get child locations
exports.getChildLocations = async (req, res) => {
    try {
        const { parentId } = req.params;

        const [locations] = await db.query(
            'SELECT loc_id, loc_name, loc_type FROM locations WHERE parent_id = ? ORDER BY loc_name',
            [parentId]
        );

        res.json(locations);
    } catch (error) {
        console.error('Get child locations error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};
