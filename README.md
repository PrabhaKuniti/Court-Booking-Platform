# Court Booking Platform

A full-stack web application for managing multi-resource bookings at a sports facility with dynamic pricing, atomic transactions, and waitlist functionality.

## Features

### Core Features
- **Multi-Resource Booking**: Book courts, equipment (rackets, shoes), and coaches in a single atomic transaction
- **Dynamic Pricing Engine**: Configurable pricing rules that stack (peak hours, weekends, indoor premium, etc.)
- **Real-time Availability**: Check availability across all resource types before booking
- **Live Price Calculation**: See price breakdown as you select options
- **Admin Dashboard**: Manage courts, equipment, coaches, and pricing rules
- **Waitlist System**: Join waitlist when slots are full, get notified on cancellations

### Technical Highlights
- Atomic booking transactions using MongoDB sessions
- Concurrent booking prevention
- Efficient availability queries with database indexes
- Modular pricing engine with rule stacking
- Clean separation of concerns (controllers, models, utils)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **RESTful API** design

### Frontend
- **React.js** with functional components and hooks
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## Project Structure

```
/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Utilities (pricing, availability)
│   ├── scripts/         # Seed scripts
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── App.js
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/court-booking
NODE_ENV=development
```

   **For MongoDB Atlas (Cloud)**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for setup instructions.
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/court-booking?retryWrites=true&w=majority
   ```

4. Start MongoDB (if running locally):
```bash
# On macOS/Linux
mongod

# On Windows, start MongoDB service or run:
mongod.exe
```

   **Note**: If using MongoDB Atlas, skip this step and proceed to step 5.

5. Seed the database with initial data:
```bash
npm run seed
```

6. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Public Endpoints
- `GET /api/courts` - Get all active courts
- `GET /api/equipment` - Get all active equipment
- `GET /api/coaches` - Get all active coaches

### Booking Endpoints
- `GET /api/bookings/slots?courtId=&date=` - Get available slots for a court
- `POST /api/bookings/calculate-price` - Calculate booking price
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/user/:userId` - Get user's bookings
- `PATCH /api/bookings/:bookingId/cancel` - Cancel a booking
- `POST /api/bookings/waitlist` - Join waitlist

### Admin Endpoints
- `GET /api/admin/courts` - Get all courts
- `POST /api/admin/courts` - Create a court
- `PUT /api/admin/courts/:id` - Update a court
- `DELETE /api/admin/courts/:id` - Disable a court

Similar endpoints exist for equipment, coaches, and pricing rules.

## Seed Data

The seed script creates:
- 4 courts (2 indoor, 2 outdoor)
- 2 equipment types (rackets: 20 units, shoes: 15 units)
- 3 coaches with different availability schedules
- 3 pricing rules (peak hours, weekend premium, indoor premium)
- 1 test user

After running the seed script, note the test user ID printed in the console. You can use this ID for testing bookings.

## Usage

### Making a Booking

1. Navigate to the booking page
2. Select a court
3. Choose a date
4. Select an available time slot
5. Optionally add equipment (rackets, shoes)
6. Optionally select a coach
7. Review the price breakdown
8. Confirm the booking

### Admin Functions

1. Navigate to the Admin Dashboard
2. Select a tab (Courts, Equipment, Coaches, or Pricing)
3. Click "Add New" to create resources
4. View and manage existing resources
5. Toggle pricing rules on/off

## Assumptions Made

1. **User Authentication**: For simplicity, user authentication is not implemented. The frontend uses a hardcoded `userId`. In production, implement proper authentication (JWT, OAuth, etc.).

2. **Time Slots**: Bookings are for 1-hour slots from 9 AM to 10 PM. This can be configured.

3. **Currency**: All prices are in USD. No currency conversion is implemented.

4. **Notifications**: Waitlist notifications are logged to console. In production, implement email/SMS notifications.

5. **Concurrent Bookings**: MongoDB transactions prevent double bookings, but for high concurrency, consider implementing optimistic locking or queue-based booking.

6. **Date Range**: Bookings can be made up to 30 days in advance.

7. **Coach Availability**: Coaches have weekly recurring availability. One-time unavailability (sick days, holidays) is not handled.

## Database Design & Pricing Engine

See `DESIGN_DOCUMENT.md` for a detailed explanation of the database schema and pricing engine architecture.

## Testing

### Manual Testing
1. Create a booking with all resources
2. Try to book the same slot twice (should fail)
3. Cancel a booking and check waitlist notification
4. Test pricing rules by booking during peak hours/weekends
5. Test admin functions to create/modify resources

### API Testing
Use Postman or Insomnia to test API endpoints directly. Import the following sample request:

**Create Booking:**
```json
POST http://localhost:5000/api/bookings
Content-Type: application/json

{
  "userId": "YOUR_USER_ID",
  "courtId": "COURT_ID",
  "startTime": "2024-01-15T18:00:00Z",
  "endTime": "2024-01-15T19:00:00Z",
  "rackets": 2,
  "shoes": 1,
  "coachId": "COACH_ID"
}
```

## Deployment

### Quick Deploy (10 minutes)
See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a fast deployment guide.

### Full Deployment Guide
- **Backend to Render**: See [DEPLOY_RENDER_VERCEL.md](./DEPLOY_RENDER_VERCEL.md)
- **Frontend to Vercel**: See [DEPLOY_RENDER_VERCEL.md](./DEPLOY_RENDER_VERCEL.md)
- **Deployment Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Recommended Platforms
- **Backend**: Render (free tier available)
- **Frontend**: Vercel (free tier available)
- **Database**: MongoDB Atlas (free tier available)

## Future Enhancements

- User authentication and authorization
- Payment integration
- Email/SMS notifications
- Calendar view for bookings
- Recurring bookings
- Coach one-time unavailability management
- Advanced analytics and reporting
- Mobile app

## License

This project is created for demonstration purposes.

## Contact

For questions or issues, please refer to the codebase documentation or create an issue in the repository.

