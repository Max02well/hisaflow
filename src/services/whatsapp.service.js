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

    async sendProductList(to, products) {
        const sections = [
            {
                title: "🛍️ Available Products",
                rows: products.slice(0, 10).map(p => ({
                    id: p.id,
                    title: p.name.slice(0, 24),
                    description: `KES ${p.price} | Stock: ${p.stock}`
                }))
            }
        ];

        await axios.post(`${BASE_URL}/messages`, {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "list",
                body: {
                    text: "🛒 Choose a product below:"
                },
                footer: {
                    text: "Hisaflow Store"
                },
                action: {
                    button: "View Products",
                    sections
                }
            }
        }, { headers });
    },

    async sendProductButtons(to) {
        await axios.post(`${BASE_URL}/messages`, {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "What would you like to do?"
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: { id: "CATALOG", title: "🛍️ View Catalog" }
                        },
                        {
                            type: "reply",
                            reply: { id: "ORDER", title: "🛒 Place Order" }
                        }
                    ]
                }
            }
        }, { headers });
    },

    //order intent handler
    async processOrderIntent(to, text) {
        // Simple placeholder — wire up AI/DB later
        await this.sendText(to, `Got it! We received your request: "${text}". Our team will confirm shortly.`)
    },

    // Sends an interactive button message for order confirmation
    async sendConfirmation(to, product) {
        const res = await axios.post(`${BASE_URL}/messages`, {
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `🛍️ You selected:\n\n*${product.name}*\n💰 Price: KES ${product.price}\n📦 In stock: ${product.stock} units\n\nConfirm your order?`
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: { id: `confirm_${product.id}`, title: '✅ Confirm' }
                        },
                        {
                            type: 'reply',
                            reply: { id: `cancel_${product.id}`, title: '❌ Cancel' }
                        }
                    ]
                }
            }
        }, { headers })
        return res.data
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