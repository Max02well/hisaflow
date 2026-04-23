import axios from 'axios'
import { env } from '../config/env.js'

const BASE_URL = `https://graph.facebook.com/v25.0/${env.WHATSAPP_PHONE_NUMBER_ID}`

const headers = {
  'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
}

export const whatsappService = {
  // Send a plain text message
  async sendText(to, message) {
    const res = await axios.post(`${BASE_URL}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }, { headers })
    return res.data
  },

  // Send a list of products as text (carousel requires approved templates)
  async sendProductCarousel(to, products) {
    const lines = products.map(p => `• *${p.name}* — KES ${p.price} (${p.stock} left)`).join('\n')
    const body = `🛒 *Available Products:*\n\n${lines}\n\nReply with "buy [product name]" to order.`
    return this.sendText(to, body)
  },

  // Basic order intent handler
  async processOrderIntent(to, text) {
    // Simple placeholder — wire up AI/DB later
    await this.sendText(to, `Got it! We received your request: "${text}". Our team will confirm shortly.`)
  },

  // Send a template message (e.g. hello_world)
  async sendTemplate(to, templateName = 'hello_world', languageCode = 'en_US') {
    const res = await axios.post(`${BASE_URL}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    }, { headers })
    return res.data
  },
}