import dotenv from 'dotenv'

dotenv.config()

export const env = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hisaflow'
    },

    whatsapp: {
        apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        apiUrl: 'https://graph.facebook.com'
    },

    openai: {
        apiKey: process.env.OPENAI_API_KEY
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    payment: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY
        },
        mpesa: {
            consumerKey: process.env.MPESA_CONSUMER_KEY,
            consumerSecret: process.env.MPESA_CONSUMER_SECRET,
            passkey: process.env.MPESA_PASSKEY
        }
    },

    cors: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001'
    }
}

// Validation
if (!env.whatsapp.accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is required')
}
if (!env.whatsapp.verifyToken) {
    throw new Error('WHATSAPP_VERIFY_TOKEN is required')
}