import { prisma } from '../services/prisma.service.js';
import { aiService } from '../services/ai.service.js';
import { whatsappService } from '../services/whatsapp.service.js';
import { sessionService } from '../services/session.service.js';

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

      const GREETINGS = ['hi', 'hello', 'hey', 'start', 'menu']
        
      //PRODUCT SELECTION FIRST
      if (message.interactive?.type === 'list_reply') {
        const productId = message.interactive.list_reply.id;
        let result;
        try {
          result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
              where: { id: productId }
            });
            if (!product || product.stock <= 0) {
              throw new Error("OUT_OF_STOCK");
            }

            // if (!product || product.stock <= 0) {
            //   await whatsappService.sendText(from, "❌ Product out of stock.");
            //   return res.sendStatus(200);
            // }

            // Create order
            const order = await tx.order.create({
              data: {
                customer: from,
                total: product.price,
                status: "PENDING",
                items: {
                  create: [{
                    productId: product.id,
                    quantity: 1,
                    price: product.price
                  }]
                }
              }
            });

            // Reserve stock
            await tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: 1 } }
            });

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                action: "RESERVED",
                quantity: 1
              }
            });
            return { order, product };
          });
        } catch (err) {
          if (err.message === "OUT_OF_STOCK") {
            await whatsappService.sendText(from, "❌ Product out of stock.");
            return res.sendStatus(200);
          }

          console.error(err);
          return res.sendStatus(200);
        }

        const paymentLink = `https://your-payment-link.com/pay/${result.order.id}`;

        await whatsappService.sendText(
          from,
          `🧾 Order created for *${result.product.name}*\n💰 Amount: KES ${result.product.price}\n\n👉 Pay here:\n${paymentLink}`
        );

        return res.sendStatus(200);
      }

      // Handle interactive messages (buttons/lists)
      if (message.interactive) {
        const interactive = message.interactive;
        // if (interactive.type === 'list_reply') {
        //   text = interactive.list_reply.title.toLowerCase();
        // }


        if (interactive.type === 'button_reply') {
          text = interactive.button_reply.id.toLowerCase();
        }
      }
      // Greetings
      if (GREETINGS.some(g => text.startsWith(g))) {
          await whatsappService.sendText(from,
            `👋 Welcome to HisaFlow!\n\nReply with:\n• *catalog* — browse products\n• *orders* — view your orders\n• *help* — get support`
          )
          return res.sendStatus(200);
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
      
      // Orders
      if (text === 'orders' || text === 'my orders') {
          const orders = await prisma.order.findMany({
            where: { customerPhone: from },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { items: { include: { product: true } } }
          })

          if (!orders.length) {
            await whatsappService.sendText(from, "You have no orders yet.")
            return res.sendStatus(200)
          }

          const summary = orders.map(o =>
            `🧾 Order #${o.id.slice(-6)}\n   Status: ${o.status}\n   Total: KES ${o.total}`
          ).join('\n\n')

          await whatsappService.sendText(from, `Your recent orders:\n\n${summary}`)
          return res.sendStatus(200)
        }

      // AI intent
      if (text.includes('want') || text.includes('buy')) {
        const intent = await aiService.extractIntent(text);

        const products = await prisma.product.findMany({
          where: {
            stock: { gt: 0 },
            name: {
              contains: intent.product?.split(' ')[0] || '',
              mode: "insensitive"
            }
          }
        });

        if (products.length === 0) {
          await whatsappService.sendText(from, "No matching products found.");
          return res.sendStatus(200);
        }

        await whatsappService.sendProductList(from, products);
        // After sending product list, save state
        sessionService.set(from, { step: 'AWAITING_SELECTION' })
        return res.sendStatus(200);
      }

      // fallback
      await whatsappService.sendText(
        from,
        "Hi 👋 Type *catalog* to view our products."
      );

      return res.sendStatus(200);

    } catch (error) {
      console.error("Webhook error:", error);
      return res.sendStatus(200);
    }
  }
};