import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public APIs
export const getCourts = () => api.get('/courts');
export const getEquipment = () => api.get('/equipment');
export const getCoaches = () => api.get('/coaches');

// User APIs
export const createUser = (userData) => api.post('/users/create', userData);
export const getUser = (userId) => api.get(`/users/${userId}`);

// Booking APIs
export const getAvailableSlots = (courtId, date) =>
  api.get('/bookings/slots', { params: { courtId, date } });

export const calculatePrice = (bookingData) =>
  api.post('/bookings/calculate-price', bookingData);

export const createBooking = (bookingData) =>
  api.post('/bookings', bookingData);

export const getUserBookings = (userId) =>
  api.get(`/bookings/user/${userId}`);

export const cancelBooking = (bookingId) =>
  api.patch(`/bookings/${bookingId}/cancel`);

export const addToWaitlist = (waitlistData) =>
  api.post('/bookings/waitlist', waitlistData);

// Admin APIs
export const getAdminCourts = () => api.get('/admin/courts');
export const createCourt = (data) => api.post('/admin/courts', data);
export const updateCourt = (id, data) => api.put(`/admin/courts/${id}`, data);
export const deleteCourt = (id) => api.delete(`/admin/courts/${id}`);

export const getAdminEquipment = () => api.get('/admin/equipment');
export const createEquipment = (data) => api.post('/admin/equipment', data);
export const updateEquipment = (id, data) => api.put(`/admin/equipment/${id}`, data);

export const getAdminCoaches = () => api.get('/admin/coaches');
export const createCoach = (data) => api.post('/admin/coaches', data);
export const updateCoach = (id, data) => api.put(`/admin/coaches/${id}`, data);

export const getPricingRules = () => api.get('/admin/pricing-rules');
export const createPricingRule = (data) => api.post('/admin/pricing-rules', data);
export const updatePricingRule = (id, data) => api.put(`/admin/pricing-rules/${id}`, data);
export const togglePricingRule = (id) => api.patch(`/admin/pricing-rules/${id}/toggle`);
export const deletePricingRule = (id) => api.delete(`/admin/pricing-rules/${id}`);

export default api;

