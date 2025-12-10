import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getUserBookings, cancelBooking } from '../services/api';

const BookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBookings();
  }, [userId]);

  const loadBookings = async () => {
    try {
      const res = await getUserBookings(userId);
      setBookings(res.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      loadBookings();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to cancel booking' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {booking.court?.name || 'Court'}
                  </h3>
                  <p className="text-gray-600">
                    {format(new Date(booking.startTime), 'MMM dd, yyyy')} •{' '}
                    {format(new Date(booking.startTime), 'HH:mm')} -{' '}
                    {format(new Date(booking.endTime), 'HH:mm')}
                  </p>
                  
                  <div className="mt-2 space-y-1">
                    {booking.resources.rackets > 0 && (
                      <p className="text-sm text-gray-600">
                        Rackets: {booking.resources.rackets}
                      </p>
                    )}
                    {booking.resources.shoes > 0 && (
                      <p className="text-sm text-gray-600">
                        Shoes: {booking.resources.shoes}
                      </p>
                    )}
                    {booking.resources.coach && (
                      <p className="text-sm text-gray-600">
                        Coach: {booking.resources.coach?.name || 'N/A'}
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${booking.pricingBreakdown?.total?.toFixed(2) || '0.00'}
                  </p>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {booking.pricingBreakdown?.appliedRules?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">Applied Rules:</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.pricingBreakdown.appliedRules.map((rule, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {rule.ruleName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

