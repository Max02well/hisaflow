import axios from 'axios'
import { env } from '../config/env.js'

const BASE_URL = 'https://sandbox.safaricom.co.ke'

export const mpesaService = {

  async getAccessToken() {
    const auth = Buffer.from(
      `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`
    ).toString('base64')

    const res = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` }
      }
    )

    return res.data.access_token
  },

  async stkPush(phone, amount, orderId) {
    const token = await this.getAccessToken()

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)

    const password = Buffer.from(
      `${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    const res = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: env.MPESA_CALLBACK_URL,
        AccountReference: `ORDER-${orderId}`,
        TransactionDesc: "Payment for order"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
  }
}