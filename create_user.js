const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('Usage: node create_user.js <name> <email> <password> [role]');
    console.log('Role options: user (default), publisher, admin');
    process.exit(1);
}

const [name, email, password, role = 'user'] = args;

async function createUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'marsad'
        });

        console.log('Connected to database...');

        // Check if user exists
        const [existing] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.error('Error: Email already exists');
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine roles
        const isAdmin = role === 'admin';
        const isPublisher = role === 'publisher' || role === 'admin';

        // Insert user (auto-verified since created by script)
        const [result] = await connection.query(
            'INSERT INTO users (name, email, password, is_admin, is_publisher, is_verified) VALUES (?, ?, ?, ?, ?, TRUE)',
            [name, email, hashedPassword, isAdmin, isPublisher]
        );

        console.log(`User created successfully! ID: ${result.insertId}`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Role: ${role}`);

        await connection.end();
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
}

createUser();
