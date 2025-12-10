// Simple user management utility
// In production, this would integrate with authentication
import { createUser } from '../services/api';

export const getOrCreateUser = async () => {
  // Check if user ID exists in localStorage
  let userId = localStorage.getItem('userId');
  
  if (!userId) {
    try {
      // Create a new user in the backend
      const response = await createUser({
        name: 'Guest User',
        email: `guest-${Date.now()}@example.com`,
        phone: '+1234567890',
      });
      userId = response.data.userId;
      localStorage.setItem('userId', userId);
    } catch (error) {
      console.error('Failed to create user:', error);
      // Fallback to a temporary ID
      userId = `temp-${Date.now()}`;
      localStorage.setItem('userId', userId);
    }
  }
  
  return userId;
};

export const getUserId = () => {
  return localStorage.getItem('userId');
};

