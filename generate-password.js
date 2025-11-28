// Helper script to generate bcrypt password hash for admin user
const bcrypt = require('bcryptjs');

// Default password: admin123
const password = process.argv[2] || 'admin123';

const hash = bcrypt.hashSync(password, 10);

console.log('\n=================================');
console.log('Password Hash Generator');
console.log('=================================\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nUse this SQL to update admin user:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@lebanon-reports.com';\n`);
