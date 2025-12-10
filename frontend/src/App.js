import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import BookingHistory from './pages/BookingHistory';
import AdminDashboard from './pages/AdminDashboard';
import { getOrCreateUser } from './utils/user';

function App() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get or create user ID
    getOrCreateUser().then(id => {
      setUserId(id);
      setLoading(false);
    });
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">🏸 Court Booking Platform</h1>
              <div className="space-x-4">
                <Link to="/" className="hover:text-blue-200 transition">
                  Book Court
                </Link>
                <Link to="/history" className="hover:text-blue-200 transition">
                  My Bookings
                </Link>
                <Link to="/admin" className="hover:text-blue-200 transition">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Routes>
              <Route path="/" element={<BookingPage userId={userId} />} />
              <Route path="/history" element={<BookingHistory userId={userId} />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;

