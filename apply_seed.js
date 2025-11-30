const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applySeed() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'marsad',
            multipleStatements: true
        });

        console.log('Connected to database...');

        const seedPath = path.join(__dirname, 'database', 'seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('Executing seed...');
        await connection.query(seedSql);
        console.log('Seed data applied successfully!');

        await connection.end();
    } catch (error) {
        console.error('Error applying seed:', error);
        process.exit(1);
    }
}

applySeed();
