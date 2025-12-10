# Deployment Checklist - Render + Vercel

Quick checklist to ensure successful deployment.

## Pre-Deployment

- [ ] Code is committed to GitHub
- [ ] MongoDB Atlas cluster is running
- [ ] MongoDB Atlas network access allows Render IPs (or 0.0.0.0/0 for now)
- [ ] Backend `.env` file has correct MongoDB Atlas connection string
- [ ] All dependencies are in `package.json`

## Backend Deployment (Render)

### Step 1: Create Render Service
- [ ] Signed up/Logged into Render (https://render.com)
- [ ] Connected GitHub account
- [ ] Created new Web Service
- [ ] Selected correct repository
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Selected Free plan (or paid)

### Step 2: Environment Variables
- [ ] Added `MONGODB_URI` = `mongodb+srv://Prabha:Acornglobus@cluster0.wqtdjnk.mongodb.net/court-booking?retryWrites=true&w=majority`
- [ ] Added `NODE_ENV` = `production`
- [ ] Added `PORT` = `10000` (optional, Render sets this automatically)

### Step 3: Deploy & Verify
- [ ] Clicked "Create Web Service"
- [ ] Waited for build to complete (2-5 minutes)
- [ ] Noted backend URL: `https://your-app-name.onrender.com`
- [ ] Tested health endpoint: `https://your-app-name.onrender.com/health`
- [ ] Tested API: `https://your-app-name.onrender.com/api/courts`

### Step 4: Seed Database
- [ ] Opened Render Shell
- [ ] Ran: `npm run seed`
- [ ] Verified data in MongoDB Atlas (Browse Collections)

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project
- [ ] Signed up/Logged into Vercel (https://vercel.com)
- [ ] Connected GitHub account
- [ ] Imported repository
- [ ] Set Root Directory: `frontend`
- [ ] Framework Preset: `Create React App` (auto-detected)
- [ ] Build Command: `npm run build` (auto-detected)
- [ ] Output Directory: `build` (auto-detected)

### Step 2: Environment Variables
- [ ] Added `REACT_APP_API_URL` = `https://your-backend-name.onrender.com/api`
- [ ] Replaced `your-backend-name` with actual Render service name

### Step 3: Deploy & Verify
- [ ] Clicked "Deploy"
- [ ] Waited for build to complete (1-3 minutes)
- [ ] Noted frontend URL: `https://your-project.vercel.app`
- [ ] Opened frontend URL in browser
- [ ] Verified page loads without errors

### Step 4: Test Application
- [ ] Can see booking page
- [ ] Can select court
- [ ] Can see available time slots
- [ ] Can add equipment/coach
- [ ] Can see price breakdown
- [ ] Can create booking
- [ ] Can view booking history
- [ ] Admin dashboard accessible

## Post-Deployment

### Backend
- [ ] Backend URL is accessible
- [ ] Health endpoint returns OK
- [ ] API endpoints return data
- [ ] Database connection working
- [ ] Logs show no errors

### Frontend
- [ ] Frontend URL is accessible
- [ ] No console errors
- [ ] API calls successful (check Network tab)
- [ ] All features working
- [ ] Responsive design works

### Integration
- [ ] Frontend can communicate with backend
- [ ] CORS configured correctly (if needed)
- [ ] No CORS errors in browser console
- [ ] Bookings can be created
- [ ] Data persists in MongoDB Atlas

## Troubleshooting

### If Backend Fails
- [ ] Check Render logs for errors
- [ ] Verify environment variables are set
- [ ] Check MongoDB Atlas connection
- [ ] Verify network access in Atlas
- [ ] Test connection string locally

### If Frontend Fails
- [ ] Check Vercel build logs
- [ ] Verify `REACT_APP_API_URL` is correct
- [ ] Check browser console for errors
- [ ] Verify backend is accessible
- [ ] Check Network tab for failed requests

### If API Calls Fail
- [ ] Verify backend URL in frontend env var
- [ ] Check CORS configuration
- [ ] Verify backend is running (not sleeping)
- [ ] Check MongoDB Atlas connection
- [ ] Review browser console errors

## Security Checklist

- [ ] MongoDB Atlas password is strong
- [ ] Environment variables not in Git
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured (restrict in production)
- [ ] HTTPS enabled (both platforms)
- [ ] Network access restricted (production)

## URLs to Save

- **Backend URL**: `https://your-backend-name.onrender.com`
- **Frontend URL**: `https://your-project.vercel.app`
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

## Next Steps

- [ ] Set up custom domains (optional)
- [ ] Configure monitoring/alerts
- [ ] Set up automated backups
- [ ] Add authentication (if needed)
- [ ] Configure CI/CD (already done via Git)

---

**Deployment Complete!** 🎉

Your app is now live at:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend-name.onrender.com`

