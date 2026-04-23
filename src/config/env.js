// import dotenv from 'dotenv'

// dotenv.config()

// export const env = {
//     port: process.env.PORT || 5000,
//     nodeEnv: process.env.NODE_ENV || 'development',

//     database: {
//         url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hisaflow'
//     },

//     whatsapp: {
//         apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
//         accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
//         verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
//         phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
//         businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
//         apiUrl: 'https://graph.facebook.com'
//     },

//     openai: {
//         apiKey: process.env.OPENAI_API_KEY
//     },

//     redis: {
//         url: process.env.REDIS_URL || 'redis://localhost:6379'
//     },

//     jwt: {
//         secret: process.env.JWT_SECRET,
//         expiresIn: process.env.JWT_EXPIRES_IN || '7d'
//     },

//     payment: {
//         stripe: {
//             secretKey: process.env.STRIPE_SECRET_KEY
//         },
//         mpesa: {
//             consumerKey: process.env.MPESA_CONSUMER_KEY,
//             consumerSecret: process.env.MPESA_CONSUMER_SECRET,
//             passkey: process.env.MPESA_PASSKEY
//         }
//     },

//     cors: {
//         frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001'
//     }
// }
import 'dotenv/config'

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8081',

  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v25.0',
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'super',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hisaflow',

  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY: process.env.MPESA_PASSKEY,
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
}
// Validation
if (!env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is required')
}
if (!env.WHATSAPP_VERIFY_TOKEN) {
    throw new Error('WHATSAPP_VERIFY_TOKEN is required')
}