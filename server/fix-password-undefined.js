// server/fix-password-undefined.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/house-hunting';
const AGENT_EMAIL = 'test@gmail.com';
const NEW_PASSWORD = 'TempPass123';

async function fixUndefinedPassword() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const User = require('./src/models/User');

    // Find user and check current state
    const user = await User.findOne({ email: AGENT_EMAIL });
    console.log('👤 User found:', user.email);
    console.log('🔑 Current password field:', user.password);
    console.log('📝 User document:', JSON.stringify(user, null, 2));
    
    if (user.password === undefined || user.password === null) {
      console.log('\n🚨 PASSWORD IS UNDEFINED - FIXING...');
      
      // Set password directly and save
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(NEW_PASSWORD, salt);
      user.mustChangePassword = true;
      
      // Use save() to trigger any pre-save hooks
      await user.save();
      
      console.log('✅ Password set and saved');
      console.log('🔑 New password hash:', user.password);
    } else {
      console.log('✅ Password already exists:', user.password ? 'YES' : 'NO');
    }

    // Verify the save worked by re-fetching
    console.log('\n🔄 Verifying save...');
    const verifiedUser = await User.findOne({ email: AGENT_EMAIL });
    console.log('🔑 Verified password field:', verifiedUser.password);
    console.log('✅ Verified mustChangePassword:', verifiedUser.mustChangePassword);

    // Test the comparison
    console.log('\n🧪 Testing password comparison...');
    const isMatch = await bcrypt.compare(NEW_PASSWORD, verifiedUser.password);
    console.log('🔑 Password comparison result:', isMatch);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Fix completed');
    process.exit(0);
  }
}

fixUndefinedPassword();