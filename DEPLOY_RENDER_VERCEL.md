# Deploy Backend to Render & Frontend to Vercel

Complete step-by-step guide to deploy your Court Booking Platform.

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git remote add origin https://github.com/yourusername/your-repo.git
     git branch -M main
     git push -u origin main
     ```

### Step 2: Deploy to Render

1. **Sign up/Login to Render**:
   - Go to https://render.com
   - Sign up with GitHub (recommended) or email

2. **Create New Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `court-booking-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   Click **"Advanced"** → **"Add Environment Variable"**:
   
   ```
   MONGODB_URI = mongodb+srv://Prabha:Acornglobus@cluster0.wqtdjnk.mongodb.net/court-booking?retryWrites=true&w=majority
   NODE_ENV = production
   PORT = 10000
   ```
   
   **Note**: Render sets PORT automatically, but we include it for safety.

5. **Select Plan**:
   - Choose **"Free"** plan (or paid for better performance)
   - Free tier includes:
     - 750 hours/month (enough for 24/7)
     - Sleeps after 15 min inactivity (wakes on request)

6. **Deploy**:
   - Click **"Create Web Service"**
   - Render will build and deploy your backend
   - Wait 2-5 minutes for deployment

7. **Get Your Backend URL**:
   - Once deployed, you'll see: `https://court-booking-api.onrender.com`
   - Copy this URL (you'll need it for frontend)

8. **Seed Database** (One-time):
   - Go to **"Shell"** tab in Render dashboard
   - Run:
     ```bash
     npm run seed
     ```

### Step 3: Update MongoDB Atlas Network Access

1. Go to MongoDB Atlas → **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for now)
   - Or add Render's IP ranges (check Render docs)
4. Click **"Confirm"**

### Step 4: Test Backend

1. Test health endpoint:
   ```bash
   curl https://your-app-name.onrender.com/health
   ```
   Should return: `{"status":"OK","message":"Court Booking API is running"}`

2. Test API:
   ```bash
   curl https://your-app-name.onrender.com/api/courts
   ```
   Should return list of courts

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. **Update API URL**:
   - Create `frontend/.env.production`:
     ```env
     REACT_APP_API_URL=https://your-app-name.onrender.com/api
     ```
   - Replace `your-app-name` with your actual Render service name

2. **Commit Changes**:
   ```bash
   git add frontend/.env.production
   git commit -m "Add production API URL"
   git push
   ```

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**:
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**:
   Click **"Environment Variables"**:
   ```
   REACT_APP_API_URL = https://your-app-name.onrender.com/api
   ```
   Replace with your actual Render backend URL.

5. **Deploy**:
   - Click **"Deploy"**
   - Vercel will build and deploy
   - Wait 1-3 minutes

6. **Get Your Frontend URL**:
   - Once deployed: `https://your-project.vercel.app`
   - Vercel also provides a custom domain

### Step 3: Update CORS (if needed)

If you get CORS errors, update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

Then redeploy to Render.

---

## Part 3: Verify Deployment

### Test Backend
1. Health check: `https://your-backend.onrender.com/health`
2. API test: `https://your-backend.onrender.com/api/courts`
3. Should return JSON data

### Test Frontend
1. Open: `https://your-project.vercel.app`
2. Try making a booking
3. Check browser console for errors
4. Verify API calls are going to Render backend

### Test Full Flow
1. Select a court
2. Choose date and time slot
3. Add equipment/coach
4. See price breakdown
5. Confirm booking
6. Check booking history

---

## Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check Render logs: **"Logs"** tab
- Verify `MONGODB_URI` is set correctly
- Check if MongoDB Atlas allows Render IPs

**"Build failed"**
- Check build logs in Render
- Verify `package.json` has correct scripts
- Ensure all dependencies are in `package.json`

**"Database connection error"**
- Verify MongoDB Atlas network access
- Check connection string format
- Test connection locally first

### Frontend Issues

**"API calls failing"**
- Check `REACT_APP_API_URL` in Vercel environment variables
- Verify backend URL is correct (no trailing slash)
- Check browser console for CORS errors

**"Build failed"**
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

**"Blank page"**
- Check browser console for errors
- Verify API URL is correct
- Check network tab for failed requests

### CORS Issues

If you see CORS errors:
1. Update `backend/server.js` CORS configuration
2. Redeploy backend to Render
3. Clear browser cache

---

## Environment Variables Summary

### Render (Backend)
```
MONGODB_URI = mongodb+srv://Prabha:Acornglobus@cluster0.wqtdjnk.mongodb.net/court-booking?retryWrites=true&w=majority
NODE_ENV = production
PORT = 10000
```

### Vercel (Frontend)
```
REACT_APP_API_URL = https://your-backend.onrender.com/api
```

---

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Database seeded with initial data
- [ ] Frontend deployed and accessible
- [ ] API calls working from frontend
- [ ] Can create bookings
- [ ] Can view booking history
- [ ] Admin dashboard accessible
- [ ] MongoDB Atlas network access configured
- [ ] CORS configured correctly
- [ ] Environment variables set in both platforms

---

## Custom Domains (Optional)

### Render Custom Domain
1. Go to Render dashboard → Your service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed

### Vercel Custom Domain
1. Go to Vercel dashboard → Your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain
4. Update DNS records as instructed

---

## Monitoring & Updates

### Render
- **Logs**: View real-time logs in dashboard
- **Metrics**: Monitor CPU, memory, response times
- **Auto-deploy**: Automatically deploys on git push

### Vercel
- **Analytics**: Built-in performance analytics
- **Logs**: View build and runtime logs
- **Auto-deploy**: Automatically deploys on git push

### Updating Your App
1. Make changes locally
2. Commit and push to GitHub
3. Both Render and Vercel auto-deploy
4. Changes go live in 2-5 minutes

---

## Cost

### Free Tier
- **Render**: Free (750 hours/month, sleeps after inactivity)
- **Vercel**: Free (unlimited for personal projects)
- **MongoDB Atlas**: Free (512 MB storage)

**Total: $0/month** for development/testing!

### Paid Options (if needed)
- **Render**: $7/month (always-on, no sleep)
- **Vercel**: $20/month (team features)
- **MongoDB Atlas**: $9/month (2 GB storage)

---

## Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**You're all set!** Your app is now live on Render (backend) and Vercel (frontend). 🚀

