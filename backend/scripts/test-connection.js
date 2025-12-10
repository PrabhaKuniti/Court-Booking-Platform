/**
 * Test script to verify MongoDB Atlas connection
 * Usage: node scripts/test-connection.js
 */
require('dotenv').config();
const connectDB = require('../config/database');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗');
    
    await connectDB();
    
    console.log('\n✅ Connection successful!');
    console.log('You can now run: npm run seed');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check MONGODB_URI in .env file');
    console.log('2. Verify MongoDB Atlas cluster is running');
    console.log('3. Check network access in MongoDB Atlas');
    console.log('4. Verify username/password are correct');
    process.exit(1);
  }
}

testConnection();

