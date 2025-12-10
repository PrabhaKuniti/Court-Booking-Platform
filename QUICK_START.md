# Quick Start Guide

Follow these steps to get the application running quickly.

## Prerequisites Check

```bash
# Check Node.js version (should be 14+)
node --version

# MongoDB: Use MongoDB Atlas (cloud) - no local installation needed!
# See MONGODB_ATLAS_SETUP.md for quick setup (5 minutes)
```

## Step-by-Step Setup

### 1. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with MongoDB Atlas connection string
# First, set up MongoDB Atlas (see MONGODB_ATLAS_SETUP.md)
# Then create .env file:
echo "PORT=5000" > .env
echo "MONGODB_URI=your_mongodb_atlas_connection_string_here" >> .env
echo "NODE_ENV=development" >> .env

# For local MongoDB (alternative):
# echo "MONGODB_URI=mongodb://localhost:27017/court-booking" >> .env
# Then start MongoDB: mongod (macOS/Linux) or mongod.exe (Windows)

# Test MongoDB connection (optional but recommended)
npm run test-connection

# Seed the database
npm run seed

# Note the Test User ID printed in the console
# Example: Test User ID: 507f1f77bcf86cd799439011

# Start the server
npm run dev
```

The backend should now be running at `http://localhost:5000`

### 2. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend should open automatically at `http://localhost:3000`

## Testing the Application

### 1. Make a Booking

1. Go to `http://localhost:3000`
2. Select a court (e.g., "Indoor Court 1")
3. Choose today's date
4. Click an available time slot (e.g., 10:00)
5. Add equipment if desired (rackets, shoes)
6. Optionally select a coach
7. Review the price breakdown
8. Click "Confirm Booking"

**Note**: The frontend uses localStorage for user ID. If you want to use the seeded test user, you can:
- Open browser console
- Run: `localStorage.setItem('userId', 'YOUR_SEEDED_USER_ID')`
- Refresh the page

### 2. Test Pricing Rules

- **Peak Hours**: Book a slot between 6 PM - 9 PM to see 50% surcharge
- **Weekend**: Book on Saturday or Sunday to see 30% surcharge
- **Indoor Premium**: Book an indoor court to see $5 additional fee
- **Stacking**: Book an indoor court on weekend during peak hours to see all rules apply

### 3. Test Admin Dashboard

1. Navigate to Admin tab
2. Try creating a new court, equipment, coach, or pricing rule
3. Toggle pricing rules on/off
4. View existing resources

### 4. Test Waitlist

1. Book a slot
2. Try to book the same slot again (should fail)
3. Choose "Join Waitlist" when prompted
4. Cancel the first booking
5. Check console for waitlist notification (in production, this would be email/SMS)

## Common Issues

### MongoDB Connection Error

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**: 
- Make sure MongoDB is running
- Check if MongoDB URI in `.env` is correct
- For MongoDB Atlas, update the connection string

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
- Change PORT in backend/.env to a different port (e.g., 5001)
- Update frontend/.env REACT_APP_API_URL accordingly

### CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Make sure backend is running
- Check that REACT_APP_API_URL in frontend matches backend URL
- Backend CORS is configured to allow all origins (development only)

### No Available Slots

**Solution**:
- Make sure you selected a date (not in the past)
- Try a different court
- Check if all slots are booked (try cancelling a booking first)

## API Testing with cURL

### Get Available Courts
```bash
curl http://localhost:5000/api/courts
```

### Calculate Price
```bash
curl -X POST http://localhost:5000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "courtId": "COURT_ID",
    "startTime": "2024-01-15T18:00:00Z",
    "endTime": "2024-01-15T19:00:00Z",
    "rackets": 2,
    "shoes": 1
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "courtId": "COURT_ID",
    "startTime": "2024-01-15T18:00:00Z",
    "endTime": "2024-01-15T19:00:00Z",
    "rackets": 2,
    "shoes": 1,
    "coachId": "COACH_ID"
  }'
```

Replace `COURT_ID`, `USER_ID`, and `COACH_ID` with actual IDs from your database.

## Next Steps

- Read `README.md` for detailed documentation
- Read `DESIGN_DOCUMENT.md` for architecture details
- Explore the codebase to understand the implementation
- Customize pricing rules in the admin dashboard
- Add more courts, equipment, or coaches as needed

## Getting Help

If you encounter issues:
1. Check the console logs (both backend and frontend)
2. Verify MongoDB is running and accessible
3. Ensure all dependencies are installed
4. Check that ports 3000 and 5000 are not in use
5. Review the error messages for specific guidance

