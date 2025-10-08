// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n✅ MongoDB Connected');
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}\n`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Connection events (optional but helpful)
mongoose.connection.on('connected', () => console.log('🔌 Mongoose connected'));
mongoose.connection.on('error', (err) => console.error(`💥 Mongoose error: ${err}`));
mongoose.connection.on('disconnected', () => console.log('🛑 Mongoose disconnected'));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Mongoose connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
