# Lebanon Breach Reporting System

نظام الإبلاغ عن الخروقات في لبنان - A comprehensive Arabic website for reporting security breaches in Lebanon with Google Maps integration.

## 🌟 Features

- 🗺️ **Google Maps Integration** - Interactive map centered on Lebanon
- 🇱🇧 **Arabic RTL Interface** - Full Arabic support with right-to-left layout
- 🔐 **User Authentication** - JWT-based authentication with role management
- 👥 **Role-Based Access** - Publisher and Admin roles with different permissions
- 📍 **Geolocation Validation** - Reports restricted to Lebanon boundaries
- 📊 **Multiple Categories** - Drones, Military Planes, Missiles, Explosions, etc.
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Dark theme with glassmorphism effects

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL or MariaDB
- Google Maps API Key
- VPS with SSH access (for deployment)

## 🚀 Installation

### 1. Clone or Download the Project

```bash
cd d:\whatsapp-system
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Import database schema
mysql -u root -p < database/schema.sql

# Import seed data (categories and locations)
mysql -u root -p < database/seed.sql
```

### 3. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your configuration
# - Set database credentials
# - Set JWT secret key
# - Set Google Maps API key
```

**Important**: Edit the `.env` file and update:
- `DB_PASSWORD` - Your MySQL password
- `JWT_SECRET` - A random secret key for JWT tokens
- `GOOGLE_MAPS_API_KEY` - Your Google Maps API key

### 4. Create Admin User

After importing seed data, you need to create a proper admin user with a hashed password:

```bash
# Start Node.js REPL
node

# Run this code to generate password hash
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
// Copy the hash output
```

Then update the admin user in MySQL:

```sql
UPDATE users 
SET password = 'YOUR_HASHED_PASSWORD_HERE' 
WHERE email = 'admin@lebanon-reports.com';
```

### 5. Frontend Setup

Edit `frontend/index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key (appears twice in the file).

Also update the API URL in:
- `frontend/js/auth.js` (line 2)
- `frontend/login.html` (line 48)
- `frontend/register.html` (line 58)

Change `http://localhost:3000/api` to your production URL when deploying.

## 🏃 Running Locally

### Start the Backend Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### Open the Frontend

Open `frontend/index.html` in your browser, or use a local server:

```bash
npx serve frontend
```

Then visit `http://localhost:5000`

## 📦 VPS Deployment

### 1. Upload Files to VPS

```bash
# Using SCP
scp -r d:\whatsapp-system user@your-vps-ip:/var/www/

# Or using SFTP/FTP client
```

### 2. Install Dependencies on VPS

```bash
ssh user@your-vps-ip
cd /var/www/whatsapp-system
npm install --production
```

### 3. Setup MySQL Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
# Update with production settings
```

### 5. Setup Process Manager (PM2)

```bash
npm install -g pm2
pm2 start backend/server.js --name lebanon-reports
pm2 save
pm2 startup
```

### 6. Setup Nginx

Create Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/whatsapp-system/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Setup SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔑 Default Credentials

- **Email**: admin@lebanon-reports.com
- **Password**: admin123

**⚠️ Change the password immediately after first login!**

## 📱 Usage

### For Regular Users
1. Visit the website
2. View reports on the map
3. Filter by category
4. Click on markers to view report details

### For Publishers
1. Register an account
2. Wait for admin to promote you to publisher
3. Login and click on the map to create reports
4. Fill in category and description
5. Submit the report

### For Admins
1. Login with admin credentials
2. Manage users (promote to publisher)
3. Manage categories
4. Moderate reports

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create report (publisher only)
- `PUT /api/reports/:id` - Update report (owner/admin)
- `DELETE /api/reports/:id` - Delete report (owner/admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL user | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | lebanon_reports |
| `JWT_SECRET` | JWT secret key | - |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | - |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

## 📝 License

This project is open source and available for use.

## 🤝 Support

For issues or questions, please contact the administrator.
