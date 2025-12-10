# Deployment Guide - MongoDB Atlas

This guide will help you deploy the Court Booking Platform using MongoDB Atlas (cloud database) instead of a local MongoDB instance.

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (or use existing account)
3. Verify your email address

### 1.2 Create a New Cluster

1. After logging in, click **"Build a Database"** or **"Create"** → **"Database"**
2. Choose **"M0 FREE"** tier (free forever, perfect for development)
3. Select your preferred **Cloud Provider** and **Region** (choose closest to your deployment location)
4. Click **"Create Cluster"**
5. Wait 3-5 minutes for cluster to be created

### 1.3 Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `courtbooking`)
5. Enter a strong password (save this securely!)
6. Set user privileges to **"Atlas admin"** (or **"Read and write to any database"**)
7. Click **"Add User"**

### 1.4 Configure Network Access

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development/testing, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ **Security Note**: For production, add only your server's IP addresses
4. Click **"Confirm"**

### 1.5 Get Connection String

1. In the **Deployment** section, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** as driver and **"3.6 or later"** as version
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name at the end (before the `?`):
   ```
   mongodb+srv://courtbooking:yourpassword@cluster0.xxxxx.mongodb.net/court-booking?retryWrites=true&w=majority
   ```

## Step 2: Configure Backend

### 2.1 Update Environment Variables

1. Navigate to `backend` directory
2. Create `.env` file (copy from `.env.example` if it exists):
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file:
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://courtbooking:yourpassword@cluster0.xxxxx.mongodb.net/court-booking?retryWrites=true&w=majority
   ```

   **Important**: Replace with your actual connection string from Step 1.5

### 2.2 Test Connection

1. Install dependencies (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. Test the connection:
   ```bash
   node -e "require('dotenv').config(); require('./config/database')().then(() => process.exit(0)).catch(() => process.exit(1))"
   ```

   You should see: `MongoDB Connected: cluster0.xxxxx.mongodb.net`

### 2.3 Seed the Database

1. Run the seed script to populate initial data:
   ```bash
   npm run seed
   ```

2. Verify data in MongoDB Atlas:
   - Go to **"Browse Collections"** in Atlas
   - You should see collections: users, courts, equipment, coaches, pricingrules

## Step 3: Deploy Backend

### Option A: Deploy to Heroku

1. **Install Heroku CLI**: [Download here](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   cd backend
   heroku create court-booking-api
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   heroku config:set NODE_ENV=production
   heroku config:set PORT=5000
   ```

5. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Seed Database** (one-time):
   ```bash
   heroku run npm run seed
   ```

7. **Get Your Backend URL**:
   ```bash
   heroku info
   ```
   Your API will be at: `https://court-booking-api.herokuapp.com`

### Option B: Deploy to Railway

1. Go to [Railway](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub"** (or use CLI)
3. Connect your repository
4. Add environment variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `NODE_ENV`: `production`
   - `PORT`: Railway sets this automatically
5. Deploy and get your URL

### Option C: Deploy to Render

1. Go to [Render](https://render.com) and sign up
2. Click **"New"** → **"Web Service"**
3. Connect your repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: `Node`
5. Add environment variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `NODE_ENV`: `production`
6. Deploy

### Option D: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

1. **SSH into your server**
2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository**:
   ```bash
   git clone <your-repo-url>
   cd Acorn-Globus/backend
   ```

4. **Install dependencies**:
   ```bash
   npm install --production
   ```

5. **Create .env file**:
   ```bash
   nano .env
   # Add your MongoDB Atlas connection string
   ```

6. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name court-booking-api
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx reverse proxy** (optional but recommended):
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

## Step 4: Configure Frontend

### 4.1 Update API URL

1. Navigate to `frontend` directory
2. Create `.env` file:
   ```env
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

   Replace with your actual backend URL from Step 3.

### 4.2 Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `build` folder with production-ready files.

## Step 5: Deploy Frontend

### Option A: Deploy to Netlify

1. Go to [Netlify](https://www.netlify.com) and sign up
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the `frontend/build` folder
4. Or connect GitHub and set:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
5. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL

### Option B: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Import your repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL
5. Deploy

### Option C: Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. Update `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/court-booking",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## Step 6: Update MongoDB Atlas Network Access (Production)

For production, restrict network access:

1. Go to MongoDB Atlas → **Security** → **Network Access**
2. Remove `0.0.0.0/0` (Allow from anywhere)
3. Add your backend server's IP address(es)
4. If using Heroku/Railway/Render, check their documentation for IP ranges

## Step 7: Verify Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend-url.com/health
   ```
   Should return: `{"status":"OK","message":"Court Booking API is running"}`

2. **Test Database Connection**:
   ```bash
   curl https://your-backend-url.com/api/courts
   ```
   Should return list of courts

3. **Test Frontend**:
   - Open your frontend URL
   - Try making a booking
   - Check browser console for errors

## Troubleshooting

### Connection Issues

**Error**: `MongoServerError: bad auth`
- **Solution**: Check username/password in connection string

**Error**: `MongoServerError: IP not whitelisted`
- **Solution**: Add your IP to MongoDB Atlas Network Access

**Error**: `MongooseServerSelectionError: connection timed out`
- **Solution**: Check firewall settings, verify connection string format

### Environment Variables

- Make sure `.env` file is in `backend` directory (not root)
- Never commit `.env` to Git (it's in `.gitignore`)
- For production platforms, set environment variables in their dashboard

### CORS Issues

If frontend can't connect to backend:
- Check `REACT_APP_API_URL` is correct
- Verify backend CORS settings allow your frontend domain
- Check browser console for specific error messages

## Security Checklist

- [ ] MongoDB Atlas password is strong and unique
- [ ] Network access restricted to known IPs (production)
- [ ] Environment variables not committed to Git
- [ ] Backend uses HTTPS (via platform or reverse proxy)
- [ ] Frontend uses HTTPS
- [ ] CORS configured for specific domains (not `*` in production)
- [ ] Database user has minimal required permissions

## Cost Estimation

### MongoDB Atlas (Free Tier)
- **M0 Cluster**: Free forever
- **Storage**: 512 MB (enough for thousands of bookings)
- **Bandwidth**: Shared

### Hosting (Examples)
- **Heroku**: Free tier available (with limitations)
- **Railway**: $5/month for hobby plan
- **Render**: Free tier available
- **Netlify/Vercel**: Free tier for frontend

**Total**: Can run completely free for development/testing!

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring (e.g., Sentry for error tracking)
4. Configure automated backups in MongoDB Atlas
5. Set up CI/CD pipeline
6. Add authentication (JWT, OAuth)

## Support

If you encounter issues:
1. Check MongoDB Atlas logs: **Monitoring** → **Logs**
2. Check backend logs (platform-specific)
3. Verify environment variables are set correctly
4. Test connection string locally first

