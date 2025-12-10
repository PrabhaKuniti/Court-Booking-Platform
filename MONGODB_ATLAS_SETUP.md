# Quick MongoDB Atlas Setup

This is a condensed guide for setting up MongoDB Atlas. For full deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 5-Minute Setup

### 1. Create Cluster (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up / Log in
3. Click **"Build a Database"**
4. Choose **"M0 FREE"** (free tier)
5. Select region closest to you
6. Click **"Create"**

### 2. Create Database User (1 minute)

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"**
4. Enter username: `courtbooking`
5. Enter password: (save this!)
6. Click **"Add User"**

### 3. Allow Network Access (30 seconds)

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### 4. Get Connection String (1 minute)

1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"3.6 or later"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Replace `<username>` and `<password>` with your credentials
6. Add database name: `court-booking` before the `?`
   ```
   mongodb+srv://courtbooking:yourpassword@cluster0.xxxxx.mongodb.net/court-booking?retryWrites=true&w=majority
   ```

### 5. Configure Backend (30 seconds)

1. In `backend` folder, create `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://courtbooking:yourpassword@cluster0.xxxxx.mongodb.net/court-booking?retryWrites=true&w=majority
   ```

2. Test connection:
   ```bash
   cd backend
   npm run test-connection
   ```

3. Seed database:
   ```bash
   npm run seed
   ```

## ✅ Done!

Your backend is now connected to MongoDB Atlas. You can:
- Start the server: `npm run dev`
- View data in Atlas: Click **"Browse Collections"**
- Deploy to production (see DEPLOYMENT_GUIDE.md)

## Common Issues

**"IP not whitelisted"**
→ Go to Network Access, add `0.0.0.0/0` (or your specific IP)

**"Authentication failed"**
→ Check username/password in connection string

**"Connection timeout"**
→ Verify cluster is running (green status in Atlas)

## Security Note

For production:
- Remove `0.0.0.0/0` from Network Access
- Add only your server's IP addresses
- Use strong passwords
- Enable MongoDB Atlas monitoring

