# Database Setup Guide

## Quick Setup Steps

### 1. Run the Schema
Execute the schema file to create all tables and views:
```bash
mysql -u root -p marsad < database/schema.sql
```

Or in phpMyAdmin:
- Select the `marsad` database
- Go to SQL tab
- Copy and paste the contents of `database/schema.sql`
- Click "Go"

### 2. Load Sample Categories and Admin User
Execute the seed file to create default categories and admin user:
```bash
mysql -u root -p marsad < database/seed.sql
```

Or in phpMyAdmin:
- Select the `marsad` database
- Go to SQL tab
- Copy and paste the contents of `database/seed.sql`
- Click "Go"

### 3. Load Lebanon Locations Data
Execute the locations file to populate governorates, districts, and villages:
```bash
mysql -u root -p marsad < database/lebanon_locations.sql
```

Or in phpMyAdmin:
- Select the `marsad` database
- Go to SQL tab
- Copy and paste the contents of `database/lebanon_locations.sql`
- Click "Go"

## 🔐 Default Admin Credentials

After running the seed file, you can login with:
- **Email:** `admin@marsad.com`
- **Password:** `admin123`

⚠️ **Important:** Change this password after first login!

## What Gets Created

### Tables:
- `users` - User accounts with authentication
- `categories` - Report categories (drones, missiles, etc.)
- `locations` - Lebanon governorates, districts, and villages
- `reports` - Security breach reports

### Views:
- `report_details` - Combined view of reports with category and user info

### Default Data:
- 8 report categories (طائرات مسيرة, صواريخ, انفجارات, etc.)
- 1 admin user (admin@marsad.com)
- 100+ Lebanon locations (8 governorates, districts, villages)

## Verify Setup

Check if tables were created:
```sql
USE marsad;
SHOW TABLES;
```

Check if categories were loaded:
```sql
SELECT * FROM categories;
```

Check if admin user exists:
```sql
SELECT name, email, is_admin, is_publisher FROM users;
```

Check if locations were loaded:
```sql
SELECT COUNT(*) FROM locations;
SELECT * FROM locations WHERE loc_type = 'governorate';
```

## Troubleshooting

### If you get "DROP DATABASE disabled" error:
The schema file is already configured to handle this. It uses `CREATE DATABASE IF NOT EXISTS` instead.

### If you get foreign key errors:
Make sure to run the files in order:
1. schema.sql (creates tables)
2. seed.sql (creates categories and admin user)
3. lebanon_locations.sql (populates locations)

### If you need to reset everything:
In phpMyAdmin:
1. Go to the `marsad` database
2. Click "Operations" tab
3. Scroll down to "Remove database" and click "Drop the database"
4. Then re-run all the SQL files in order

### To change admin password:
```bash
# Generate new password hash
node generate-password.js your_new_password

# Then run the UPDATE query it provides in MySQL
```
