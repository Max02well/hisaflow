import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from '../services/prisma.service.js';
// import { aiService } from '../services/ai.service.js';
import { whatsappService } from '../services/whatsapp.service.js';

export const whatsappController = {
  async handleIncomingMessage(req, res) {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      // const message = body.entry[0].changes[0].value.messages?.[0];
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) return res.sendStatus(200);

      const from = message.from; // WhatsApp number
      const text = message.text?.body?.toLowerCase();

        if (!text || typeof text !== 'string') {
          return res.sendStatus(200);
        }

      // Example commands
      if (text === 'stock' || text === 'catalog') {
        const products = await prisma.product.findMany({ where: { stock: { gt: 0 } } });
        // await whatsappService.sendProductCarousel(from, products); // Uses Meta's interactive messages
        await whatsappService.sendText(from, "Catalog coming soon...");
      } else if (text.includes('want') || text.includes('buy')) {
        // Parse intent with simple regex or send to OpenAI for better understanding
        const orderResponse = await whatsappService.processOrderIntent(from, text);
        // ... check stock, reserve, send payment link (M-Pesa/Stripe)
      }

      return res.sendStatus(200);
    }
    res.sendStatus(200);
  }
};