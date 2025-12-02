const fs = require('fs');
const path = require('path');

// HTML files to update
const htmlFiles = [
    'frontend/index.html',
    'frontend/login.html',
    'frontend/register.html',
    'frontend/dashboard.html',
    'frontend/categories.html'
];

// Script replacements
const replacements = [
    { from: 'src="js/config.js"', to: 'src="js/dist/config.min.js"' },
    { from: 'src="js/notifications.js"', to: 'src="js/dist/notifications.min.js"' },
    { from: 'src="js/auth.js"', to: 'src="js/dist/auth.min.js"' },
    { from: 'src="js/reports.js"', to: 'src="js/dist/reports.min.js"' },
    { from: 'src="js/map.js"', to: 'src="js/dist/map.min.js"' },
    { from: 'src="js/categories.js"', to: 'src="js/dist/categories.min.js"' }
];

console.log('🔒 Updating HTML files to use secured JavaScript files...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
            content = content.replace(new RegExp(from, 'g'), to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${file}`);
    } else {
        console.log(`  No changes needed for ${file}`);
    }
});

console.log('\n✅ All HTML files have been updated to use secured JavaScript files!');
console.log('📦 Minified and obfuscated files are in: frontend/js/dist/');
