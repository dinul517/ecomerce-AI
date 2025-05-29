const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,       // Wajib untuk Atlas
      tls: true,       // Tambahkan jika pakai Node.js v22+
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB Connected!');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;