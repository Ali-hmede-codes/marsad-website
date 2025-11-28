# Quick Start Guide

## Step-by-Step Setup

### 1. Install Node.js Dependencies
```bash
cd d:\whatsapp-system
npm install
```

### 2. Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Import schema
mysql -u root -p < database/schema.sql

# Import seed data
mysql -u root -p < database/seed.sql
```

### 3. Generate Admin Password
```bash
node generate-password.js
```
Copy the UPDATE query from the output and run it in MySQL.

### 4. Configure Environment
```bash
# Create .env file
copy .env.example .env

# Edit .env and update:
# - DB_PASSWORD (your MySQL password)
# - JWT_SECRET (random string)
# - GOOGLE_MAPS_API_KEY (your API key)
```

### 5. Update Frontend API URLs

Edit these files and replace `YOUR_GOOGLE_MAPS_API_KEY`:
- `frontend/index.html` (line 82 and 83)

If deploying to production, also update API_URL in:
- `frontend/js/auth.js` (line 2)
- `frontend/login.html` (line 48)
- `frontend/register.html` (line 58)
- `frontend/dashboard.html` (line 92)

### 6. Start the Server
```bash
npm start
```

### 7. Open the Application
Open `frontend/index.html` in your browser or use:
```bash
npx serve frontend
```

### 8. Login as Admin
- Email: admin@lebanon-reports.com
- Password: admin123

## Google Maps API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain (in production)

## Common Issues

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `lebanon_reports` exists

### Maps Not Loading
- Check Google Maps API key is valid
- Ensure billing is enabled on Google Cloud
- Check browser console for errors

### Authentication Not Working
- Verify JWT_SECRET is set in `.env`
- Check admin password hash was updated
- Clear browser localStorage and try again

## Next Steps

1. Create a publisher account or promote existing user
2. Test creating reports on the map
3. Configure for production deployment
4. Set up SSL certificate
5. Configure Nginx/Apache
