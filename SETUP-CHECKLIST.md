# 🚀 SETUP CHECKLIST

Use this checklist to set up the Lebanon Breach Reporting System:

## ✅ Prerequisites
- [ ] Node.js v14+ installed
- [ ] MySQL or MariaDB installed
- [ ] Google Maps API Key obtained
- [ ] Text editor (VS Code, etc.)

## 📦 Installation Steps

### 1. Install Dependencies
```bash
cd d:\whatsapp-system
npm install
```
- [ ] Dependencies installed successfully

### 2. Database Setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
- [ ] Database created
- [ ] Tables created
- [ ] Seed data imported

### 3. Generate Admin Password
```bash
node generate-password.js
```
- [ ] Password hash generated
- [ ] UPDATE query executed in MySQL

### 4. Environment Configuration
```bash
copy .env.example .env
```
Edit `.env` file:
- [ ] DB_PASSWORD set
- [ ] JWT_SECRET set (random string)
- [ ] GOOGLE_MAPS_API_KEY set

### 5. Frontend Configuration
Edit `frontend/index.html`:
- [ ] Replace `YOUR_GOOGLE_MAPS_API_KEY` (line 82)
- [ ] Replace `YOUR_GOOGLE_MAPS_API_KEY` (line 83)

### 6. Start Backend Server
```bash
npm start
```
- [ ] Server running on port 3000
- [ ] Database connected successfully

### 7. Open Frontend
Option A: Direct file
- [ ] Open `frontend/index.html` in browser

Option B: Local server (recommended)
```bash
npx serve frontend
```
- [ ] Frontend accessible at http://localhost:5000

### 8. Test the Application
- [ ] Map loads and displays Lebanon
- [ ] Can register new account
- [ ] Can login with admin (admin@lebanon-reports.com / admin123)
- [ ] Categories load in filter dropdown
- [ ] Can view reports on map

## 🎯 First Time Setup Tasks

### As Admin
- [ ] Login with admin credentials
- [ ] Change admin password
- [ ] Create test publisher account or promote existing user
- [ ] Add/modify categories if needed

### As Publisher
- [ ] Login with publisher account
- [ ] Click on map to create test report
- [ ] Verify report appears on map
- [ ] Test dashboard functionality

## 🌐 VPS Deployment (Optional)

- [ ] Upload files to VPS
- [ ] Install Node.js on VPS
- [ ] Setup MySQL on VPS
- [ ] Configure environment variables
- [ ] Install PM2 for process management
- [ ] Configure Nginx (use nginx.conf)
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Update API URLs in frontend files
- [ ] Test production deployment

## 📝 Important Notes

⚠️ **Before going live:**
1. Change admin password
2. Use strong JWT_SECRET
3. Restrict Google Maps API key to your domain
4. Enable HTTPS
5. Set up proper backups

## 🆘 Troubleshooting

**Database connection error?**
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

**Maps not loading?**
- Check API key is valid
- Ensure billing enabled on Google Cloud
- Check browser console for errors

**Can't login?**
- Verify admin password hash was updated
- Check JWT_SECRET is set
- Clear browser localStorage

**Reports not saving?**
- Check user has publisher role
- Verify location is within Lebanon
- Check browser console for errors

## ✨ You're Done!

Once all checkboxes are marked, your system is ready to use! 🎉
