// server/test-bcrypt.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/house-hunting';
const AGENT_EMAIL = 'test@gmail.com';
const TEST_PASSWORD = 'TempPass123';

async function testBcrypt() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const User = require('./src/models/User');

    // Get the user
    const user = await User.findOne({ email: AGENT_EMAIL });
    console.log('👤 User found:', user.email);
    console.log('🔑 Stored hash:', user.password);
    
    console.log('\n🧪 TESTING BCRYPT COMPARISON:');
    console.log('   Input password:', TEST_PASSWORD);
    console.log('   Stored hash:', user.password);
    
    // Test 1: Direct bcrypt comparison
    console.log('\n🔍 Test 1: Direct bcrypt.compare():');
    const directResult = await bcrypt.compare(TEST_PASSWORD, user.password);
    console.log('   Result:', directResult);
    
    // Test 2: User model's comparePassword method
    console.log('\n🔍 Test 2: User.comparePassword():');
    const modelResult = await user.comparePassword(TEST_PASSWORD);
    console.log('   Result:', modelResult);
    
    // Test 3: Create a new hash and compare
    console.log('\n🔍 Test 3: Create new hash and compare:');
    const newHash = await bcrypt.hash(TEST_PASSWORD, 10);
    console.log('   New hash:', newHash);
    const newCompare = await bcrypt.compare(TEST_PASSWORD, newHash);
    console.log('   New hash comparison:', newCompare);
    
    // Test 4: Compare new hash with stored hash
    console.log('\n🔍 Test 4: Compare hashes directly:');
    const hashCompare = user.password === newHash;
    console.log('   Hashes identical:', hashCompare);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Test completed');
    process.exit(0);
  }
}

testBcrypt();