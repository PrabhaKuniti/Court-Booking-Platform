import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { getCourts, getEquipment, getCoaches, getAvailableSlots, calculatePrice, createBooking, addToWaitlist } from '../services/api';

const BookingPage = ({ userId }) => {
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRackets, setSelectedRackets] = useState(0);
  const [selectedShoes, setSelectedShoes] = useState(0);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    try {
      const [courtsRes, equipmentRes, coachesRes] = await Promise.all([
        getCourts(),
        getEquipment(),
        getCoaches(),
      ]);
      setCourts(courtsRes.data);
      setEquipment(equipmentRes.data);
      setCoaches(coachesRes.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAvailableSlots = useCallback(async () => {
    try {
      const res = await getAvailableSlots(selectedCourt, selectedDate);
      setAvailableSlots(res.data);
      setSelectedSlot(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load available slots' });
    }
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedCourt, selectedDate, loadAvailableSlots]);

  const calculateBookingPrice = useCallback(async () => {
    if (!selectedSlot) return;

    try {
      const priceRes = await calculatePrice({
        courtId: selectedCourt,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        rackets: selectedRackets,
        shoes: selectedShoes,
        coachId: selectedCoach || null,
      });
      setPriceBreakdown(priceRes.data);
    } catch (error) {
      console.error('Price calculation error:', error);
    }
  }, [selectedCourt, selectedSlot, selectedRackets, selectedShoes, selectedCoach]);

  useEffect(() => {
    if (selectedSlot && selectedCourt) {
      calculateBookingPrice();
    }
  }, [selectedSlot, selectedCourt, selectedRackets, selectedShoes, selectedCoach, calculateBookingPrice]);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedCourt) {
      setMessage({ type: 'error', text: 'Please select a court and time slot' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createBooking({
        userId,
        courtId: selectedCourt,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        rackets: selectedRackets,
        shoes: selectedShoes,
        coachId: selectedCoach || null,
      });

      setMessage({ type: 'success', text: 'Booking confirmed successfully!' });
      
      // Reset form
      setSelectedSlot(null);
      setSelectedRackets(0);
      setSelectedShoes(0);
      setSelectedCoach('');
      setPriceBreakdown(null);
      loadAvailableSlots();
    } catch (error) {
      if (error.response?.status === 409) {
        const joinWaitlist = window.confirm('Slot is not available. Would you like to join the waitlist?');
        if (joinWaitlist) {
          try {
            await addToWaitlist({
              userId,
              courtId: selectedCourt,
              startTime: selectedSlot.startTime,
              endTime: selectedSlot.endTime,
              rackets: selectedRackets,
              shoes: selectedShoes,
              coachId: selectedCoach || null,
            });
            setMessage({ type: 'success', text: 'Added to waitlist successfully!' });
          } catch (waitlistError) {
            setMessage({ type: 'error', text: 'Failed to join waitlist' });
          }
        } else {
          setMessage({ type: 'error', text: 'Resources not available for this slot' });
        }
      } else {
        setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create booking' });
      }
    } finally {
      setLoading(false);
    }
  };

  const racketEquipment = equipment.find(e => e.type === 'racket');
  const shoesEquipment = equipment.find(e => e.type === 'shoes');

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Book a Court</h2>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Selection */}
        <div className="space-y-6">
          {/* Court Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Court
            </label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a court...</option>
              {courts.map(court => (
                <option key={court._id} value={court._id}>
                  {court.name} ({court.type}) - ${court.basePrice}/hr
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          {selectedCourt && (
            <div className="bg-white p-6 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Time Slots */}
          {selectedCourt && selectedDate && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={!slot.available}
                    className={`px-4 py-2 rounded text-sm font-medium transition ${
                      slot.available
                        ? selectedSlot?.startTime === slot.startTime
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {format(new Date(slot.startTime), 'HH:mm')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Selection */}
          {selectedSlot && (
            <>
              {racketEquipment && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rackets (${racketEquipment.rentalPrice}/hr each)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={racketEquipment.totalStock}
                    value={selectedRackets}
                    onChange={(e) => setSelectedRackets(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {racketEquipment.totalStock}
                  </p>
                </div>
              )}

              {shoesEquipment && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shoes (${shoesEquipment.rentalPrice}/hr each)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={shoesEquipment.totalStock}
                    value={selectedShoes}
                    onChange={(e) => setSelectedShoes(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {shoesEquipment.totalStock}
                  </p>
                </div>
              )}

              {/* Coach Selection */}
              <div className="bg-white p-6 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Coach (Optional)
                </label>
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No coach</option>
                  {coaches.map(coach => (
                    <option key={coach._id} value={coach._id}>
                      {coach.name} - ${coach.hourlyRate}/hr
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Price Breakdown */}
        {selectedSlot && priceBreakdown && (
          <div className="bg-white p-6 rounded-lg shadow sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Court:</span>
                <span>${priceBreakdown.courtPrice.toFixed(2)}</span>
              </div>
              
              {priceBreakdown.equipmentPrice > 0 && (
                <div className="flex justify-between">
                  <span>Equipment:</span>
                  <span>${priceBreakdown.equipmentPrice.toFixed(2)}</span>
                </div>
              )}
              
              {priceBreakdown.coachPrice > 0 && (
                <div className="flex justify-between">
                  <span>Coach:</span>
                  <span>${priceBreakdown.coachPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            {priceBreakdown.appliedRules.length > 0 && (
              <div className="border-t pt-2 mb-4">
                <p className="text-sm font-medium mb-2">Applied Pricing Rules:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {priceBreakdown.appliedRules.map((rule, idx) => (
                    <li key={idx}>
                      {rule.ruleName}: {rule.modifier === 'multiplier' 
                        ? `${((rule.value - 1) * 100).toFixed(0)}%` 
                        : `$${rule.amount.toFixed(2)}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${priceBreakdown.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;

