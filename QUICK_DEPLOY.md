# Quick Deploy Guide - Render + Vercel

## 🚀 10-Minute Deployment

### Backend to Render (5 minutes)

1. **Go to Render**: https://render.com → Sign up with GitHub

2. **New Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - **Name**: `court-booking-api`
     - **Root Directory**: `backend`
     - **Build**: `npm install`
     - **Start**: `npm start`

3. **Environment Variables**:
   ```
   MONGODB_URI = mongodb+srv://Prabha:Acornglobus@cluster0.wqtdjnk.mongodb.net/court-booking?retryWrites=true&w=majority
   NODE_ENV = production
   ```

4. **Deploy** → Wait 2-5 min → Copy URL: `https://your-app.onrender.com`

5. **Seed Database**:
   - Render Dashboard → Shell → Run: `npm run seed`

### Frontend to Vercel (5 minutes)

1. **Go to Vercel**: https://vercel.com → Sign up with GitHub

2. **Import Project**:
   - "Add New" → "Project"
   - Import repo
   - Settings:
     - **Root Directory**: `frontend`
     - **Framework**: Create React App (auto)

3. **Environment Variable**:
   ```
   REACT_APP_API_URL = https://your-app.onrender.com/api
   ```
   (Replace with your actual Render URL)

4. **Deploy** → Wait 1-3 min → Done! 🎉

## ✅ Test

- Backend: `https://your-app.onrender.com/health`
- Frontend: `https://your-project.vercel.app`
- Make a booking to verify!

## 📝 Full Guide

See `DEPLOY_RENDER_VERCEL.md` for detailed instructions.

