require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');
const User = require('../models/User');

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    await Court.deleteMany({});
    await Equipment.deleteMany({});
    await Coach.deleteMany({});
    await PricingRule.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data...');

    // Seed Courts
    const courts = await Court.insertMany([
      { name: 'Indoor Court 1', type: 'indoor', basePrice: 15, isActive: true },
      { name: 'Indoor Court 2', type: 'indoor', basePrice: 15, isActive: true },
      { name: 'Outdoor Court 1', type: 'outdoor', basePrice: 10, isActive: true },
      { name: 'Outdoor Court 2', type: 'outdoor', basePrice: 10, isActive: true },
    ]);
    console.log('✓ Seeded courts');

    // Seed Equipment
    const equipment = await Equipment.insertMany([
      { name: 'Badminton Racket', type: 'racket', totalStock: 20, rentalPrice: 5, isActive: true },
      { name: 'Sports Shoes', type: 'shoes', totalStock: 15, rentalPrice: 3, isActive: true },
    ]);
    console.log('✓ Seeded equipment');

    // Seed Coaches
    const coaches = await Coach.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        hourlyRate: 25,
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
        ],
        isActive: true,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1234567891',
        hourlyRate: 30,
        availability: [
          { dayOfWeek: 1, startTime: '14:00', endTime: '21:00' }, // Monday
          { dayOfWeek: 3, startTime: '14:00', endTime: '21:00' }, // Wednesday
          { dayOfWeek: 5, startTime: '14:00', endTime: '21:00' }, // Friday
          { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' }, // Saturday
        ],
        isActive: true,
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@example.com',
        phone: '+1234567892',
        hourlyRate: 20,
        availability: [
          { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' }, // Sunday
          { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' }, // Saturday
        ],
        isActive: true,
      },
    ]);
    console.log('✓ Seeded coaches');

    // Seed Pricing Rules
    await PricingRule.insertMany([
      {
        name: 'Peak Hours (6-9 PM)',
        type: 'peak_hour',
        isActive: true,
        startTime: '18:00',
        endTime: '21:00',
        modifier: {
          type: 'multiplier',
          value: 1.5,
        },
        description: '50% surcharge during peak evening hours',
      },
      {
        name: 'Weekend Premium',
        type: 'weekend',
        isActive: true,
        daysOfWeek: [0, 6], // Sunday and Saturday
        modifier: {
          type: 'multiplier',
          value: 1.3,
        },
        description: '30% surcharge on weekends',
      },
      {
        name: 'Indoor Court Premium',
        type: 'indoor_premium',
        isActive: true,
        appliesTo: 'indoor',
        modifier: {
          type: 'fixed_add',
          value: 5,
        },
        description: 'Additional $5 for indoor courts',
      },
    ]);
    console.log('✓ Seeded pricing rules');

    // Seed a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567899',
    });
    console.log('✓ Seeded test user');

    console.log('\n✅ Seed data created successfully!');
    console.log(`\nTest User ID: ${testUser._id}`);
    console.log('You can use this user ID to test bookings.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();

