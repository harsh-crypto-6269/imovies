import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'imovies_super_secure_jwt_secret_key_2026',
  jwtExpiresIn: '7d',
  mongoUri: process.env.MONGODB_URI || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demokey12345',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_67890',
  curatorName: 'Harsh Ranawat',
};
