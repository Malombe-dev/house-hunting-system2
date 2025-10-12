// server/final-working-reset.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/house-hunting';
const AGENT_EMAIL = 'landlord@gmail.com';
const NEW_PASSWORD = 'TempPass123';

async function finalWorkingReset() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const User = require('./src/models/User');

    // Find user WITH password selection
    console.log('🔄 Finding user with password...');
    const user = await User.findOne({ email: AGENT_EMAIL }).select('+password');
    
    console.log('👤 User found:');
    console.log('   - Email:', user.email);
    console.log('   - Current password exists:', !!user.password);
    console.log('   - Current password length:', user.password?.length);
    
    console.log('🔄 Setting new password...');
    user.password = NEW_PASSWORD; // This will trigger the pre-save hook to hash it
    user.mustChangePassword = true;
    await user.save();

    console.log('✅ Password saved successfully');
    
    // Verify by fetching WITH password selection
    console.log('🔄 Verifying save...');
    const verifiedUser = await User.findOne({ email: AGENT_EMAIL }).select('+password');
    console.log('✅ Verification:');
    console.log('   - Password exists:', !!verifiedUser.password);
    console.log('   - Password length:', verifiedUser.password?.length);
    console.log('   - mustChangePassword:', verifiedUser.mustChangePassword);

    // Test the comparison
    console.log('\n🧪 Testing password comparison...');
    const isMatch = await verifiedUser.comparePassword(NEW_PASSWORD);
    console.log('🔑 Password comparison result:', isMatch);

    if (isMatch) {
      console.log('🎉 SUCCESS! Password reset is working correctly.');
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  📋 LOGIN CREDENTIALS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  Email:    test@gmail.com');
      console.log('  Password: TempPass123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('⚠️  First login will require password change\n');
    } else {
      console.log('❌ FAILED: Password comparison still not working');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Reset completed');
    process.exit(0);
  }
}

finalWorkingReset();