# Deployment Guide

This guide covers deploying the AAU IAPAMS Backend API to production.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB database setup (MongoDB Atlas recommended)
- [ ] Cloudinary account configured
- [ ] Email service configured (Gmail with App Password)
- [ ] Environment variables prepared
- [ ] SSL certificate ready (for HTTPS)
- [ ] Domain name configured (optional)

## 🚀 Deployment Options

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create aau-iapams-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_ACCESS_SECRET=your_secret
   heroku config:set JWT_REFRESH_SECRET=your_secret
   heroku config:set JWT_RESET_SECRET=your_secret
   heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
   heroku config:set CLOUDINARY_API_KEY=your_api_key
   heroku config:set CLOUDINARY_API_SECRET=your_api_secret
   heroku config:set EMAIL_HOST=smtp.gmail.com
   heroku config:set EMAIL_PORT=587
   heroku config:set EMAIL_USER=your_email
   heroku config:set EMAIL_PASSWORD=your_app_password
   heroku config:set FRONTEND_URL=your_frontend_url
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Seed Database**
   ```bash
   heroku run npm run seed
   ```

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add Environment Variables**
   - Go to Railway dashboard
   - Add all environment variables from `.env.example`

5. **Deploy**
   ```bash
   railway up
   ```

### Option 3: DigitalOcean App Platform

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure Build Settings**
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Add Environment Variables**
   - Add all variables from `.env.example`

4. **Deploy**
   - Click "Deploy"

### Option 4: AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu Server
   - Configure security groups (ports 22, 80, 443, 5000)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install MongoDB** (or use MongoDB Atlas)
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd AAU-IAPAMS/backend
   ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Create .env File**
   ```bash
   nano .env
   # Add all environment variables
   ```

8. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

9. **Start Application**
   ```bash
   pm2 start server.js --name aau-iapams-api
   pm2 startup
   pm2 save
   ```

10. **Setup Nginx (Optional)**
    ```bash
    sudo apt-get install nginx
    sudo nano /etc/nginx/sites-available/aau-iapams
    ```
    
    Add configuration:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    
    Enable site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/aau-iapams /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

### Option 5: Render

1. **Create Account** on Render.com

2. **Create New Web Service**
   - Connect GitHub repository
   - Select backend directory

3. **Configure Service**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Add all variables from `.env.example`

5. **Deploy**
   - Click "Create Web Service"

## 🔧 MongoDB Atlas Setup

1. **Create Account** at mongodb.com/cloud/atlas

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users

3. **Create Database User**
   - Database Access → Add New Database User
   - Choose password authentication
   - Save credentials

4. **Whitelist IP Address**
   - Network Access → Add IP Address
   - For development: Allow access from anywhere (0.0.0.0/0)
   - For production: Add specific IPs

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your database user password

## 📧 Gmail App Password Setup

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification

2. **Generate App Password**
   - Security → App passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Generate password
   - Use this password in `EMAIL_PASSWORD`

## ☁️ Cloudinary Setup

1. **Create Account** at cloudinary.com

2. **Get Credentials**
   - Dashboard → Account Details
   - Copy Cloud Name, API Key, API Secret

3. **Configure Upload Presets** (Optional)
   - Settings → Upload
   - Add upload preset for better control

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database**
   - Use strong passwords
   - Enable authentication
   - Restrict network access
   - Regular backups

3. **API**
   - Enable HTTPS only
   - Use rate limiting
   - Implement CORS properly
   - Keep dependencies updated

4. **Monitoring**
   - Set up error logging (Sentry, LogRocket)
   - Monitor API performance
   - Set up uptime monitoring

## 📊 Performance Optimization

1. **Enable Compression**
   ```bash
   npm install compression
   ```
   
   In `server.js`:
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Database Indexing**
   - Indexes are already defined in models
   - Monitor slow queries

3. **Caching**
   - Consider Redis for session storage
   - Cache frequently accessed data

4. **CDN**
   - Cloudinary already provides CDN for files
   - Consider CloudFlare for API caching

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "aau-iapams-api"
          heroku_email: "your-email@example.com"
          appdir: "backend"
```

## 📝 Post-Deployment

1. **Seed Database**
   ```bash
   npm run seed
   ```

2. **Test Endpoints**
   - Import Postman collection
   - Test all critical endpoints
   - Verify file uploads work

3. **Monitor Logs**
   - Check for errors
   - Monitor performance
   - Set up alerts

4. **Update Frontend**
   - Update `VITE_API_URL` in frontend
   - Test frontend-backend integration

## 🆘 Troubleshooting

### Database Connection Issues
- Check MongoDB URI format
- Verify network access settings
- Check database user permissions

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Verify CORS settings

### Email Issues
- Verify Gmail app password
- Check SMTP settings
- Verify email address format

### CORS Issues
- Update `FRONTEND_URL` in environment
- Check CORS configuration in `server.js`

## 📞 Support

For deployment issues, check:
- Server logs
- Database logs
- Application logs
- Network connectivity

## 🔄 Updates and Maintenance

1. **Regular Updates**
   ```bash
   npm update
   npm audit fix
   ```

2. **Database Backups**
   - Set up automated backups
   - Test restore procedures

3. **Monitoring**
   - Set up uptime monitoring
   - Monitor error rates
   - Track API performance

4. **Security**
   - Regular security audits
   - Update dependencies
   - Review access logs
