import { prisma } from '../services/prisma.service.js';
import { aiService } from '../services/ai.service.js';
import { whatsappService } from '../services/whatsapp.service.js';

export const whatsappController = {
  async handleIncomingMessage(req, res) {
    try {
      const body = req.body;

      if (body.object !== 'whatsapp_business_account') {
        return res.sendStatus(200);
      }

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) return res.sendStatus(200);

      const from = message.from;

      let text = message.text?.body?.toLowerCase();

      // Handle interactive messages (buttons/lists)
      if (message.interactive) {
        const interactive = message.interactive;

        if (interactive.type === 'list_reply') {
          text = interactive.list_reply.title.toLowerCase();
        }

        if (interactive.type === 'button_reply') {
          text = interactive.button_reply.id.toLowerCase();
        }
      }

      if (!text || typeof text !== 'string') {
        return res.sendStatus(200);
      }

      // Catalog
      if (text === 'stock' || text === 'catalog') {
        const products = await prisma.product.findMany({
          where: { stock: { gt: 0 } }
        });

        await whatsappService.sendProductList(from, products);
        return res.sendStatus(200);
      }

      // AI intent
      if (text.includes('want') || text.includes('buy')) {
        const intent = await aiService.extractIntent(text);

        const products = await prisma.product.findMany({
          where: {
            stock: { gt: 0 },
            name: {
              contains: intent.product?.split(' ')[0],
              mode: "insensitive"
            }
          }
        });

        if (products.length === 0) {
          await whatsappService.sendText(from, "No matching products found.");
          return res.sendStatus(200);
        }

        await whatsappService.sendProductList(from, products);
        return res.sendStatus(200);
      }

      // fallback
      await whatsappService.sendText(
        from,
        "Hi 👋 Send *catalog* to view products or type what you want."
      );

      return res.sendStatus(200);

    } catch (error) {
      console.error("Webhook error:", error);
      return res.sendStatus(200);
    }
  }
};