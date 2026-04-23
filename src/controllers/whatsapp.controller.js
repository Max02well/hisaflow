import { prisma } from '../services/prisma.service.js';
import { aiService } from '../services/ai.service.js';
import { whatsappService } from '../services/whatsapp.service.js';
import { sessionService } from '../services/session.service.js';
import {env} from '../config/env.js';

export const whatsappController = {

  async handleIncomingMessage(req, res) {
    try {
      const body = req.body;

      if (body.object !== 'whatsapp_business_account') {
        return res.sendStatus(200);
      }

      // const entry = body.entry?.[0];
      // const changes = entry?.changes?.[0];
      // const value = changes?.value;
      // const message = value?.messages?.[0];
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
      if (!message) return res.sendStatus(200)

      const from = message.from;

      let text = message.text?.body?.toLowerCase();

      const GREETINGS = ['hi', 'hello', 'hey', 'start', 'menu']

      //PRODUCT SELECTION FIRST
      // if (message.interactive?.type === 'list_reply') {
      //   const productId = message.interactive.list_reply.id;
      //   let result;
      //   try {
      //     result = await prisma.$transaction(async (tx) => {
      //       const product = await tx.product.findUnique({
      //         where: { id: productId }
      //       });
      //       if (!product || product.stock <= 0) {
      //         throw new Error("OUT_OF_STOCK");
      //       }

      //       // if (!product || product.stock <= 0) {
      //       //   await whatsappService.sendText(from, "❌ Product out of stock.");
      //       //   return res.sendStatus(200);
      //       // }

      //       // Create order
      //       const order = await tx.order.create({
      //         data: {
      //           customer: from,
      //           total: product.price,
      //           status: "PENDING",
      //           items: {
      //             create: [{
      //               productId: product.id,
      //               quantity: 1,
      //               price: product.price
      //             }]
      //           }
      //         }
      //       });

      //       // Reserve stock
      //       await tx.product.update({
      //         where: { id: product.id },
      //         data: { stock: { decrement: 1 } }
      //       });

      //       await tx.inventoryLog.create({
      //         data: {
      //           productId: product.id,
      //           action: "RESERVED",
      //           quantity: 1
      //         }
      //       });
      //       return { order, product };
      //     });
      //   } catch (err) {
      //     if (err.message === "OUT_OF_STOCK") {
      //       await whatsappService.sendText(from, "❌ Product out of stock.");
      //       return res.sendStatus(200);
      //     }

      //     console.error(err);
      //     return res.sendStatus(200);
      //   }

      //   const paymentLink = `https://your-payment-link.com/pay/${result.order.id}`;

      //   await whatsappService.sendText(
      //     from,
      //     `🧾 Order created for *${result.product.name}*\n💰 Amount: KES ${result.product.price}\n\n👉 Pay here:\n${paymentLink}`
      //   );

      //   return res.sendStatus(200);
      // }
      if (message.interactive?.type === 'list_reply') {
        const productId = message.interactive.list_reply.id

        const product = await prisma.product.findUnique({
          where: { id: productId }
        })

        if (!product || product.stock <= 0) {
          await whatsappService.sendText(from, "❌ Sorry, that product is out of stock.")
          return res.sendStatus(200)
        }

        // Save pending selection to session before asking to confirm
        sessionService.set(from, {
          step: 'AWAITING_CONFIRMATION',
          productId: product.id,
        })

        await whatsappService.sendConfirmation(from, product)
        return res.sendStatus(200)
      }

      // Handle interactive messages (buttons/lists)
        if (message.interactive?.type === 'button_reply') {
          const buttonId = message.interactive.button_reply.id

          // ── Confirm order ──────────────────────────────────────────
          if (buttonId.startsWith('confirm_')) {
            const session = sessionService.get(from)

            if (!session || session.step !== 'AWAITING_CONFIRMATION') {
              await whatsappService.sendText(from, "⚠️ Session expired. Please browse the catalog again.\n\nType *catalog* to start.")
              return res.sendStatus(200)
            }

            let result
            try {
              result = await prisma.$transaction(async (tx) => {
                const product = await tx.product.findUnique({
                  where: { id: session.productId }
                })

                if (!product || product.stock <= 0) {
                  throw new Error('OUT_OF_STOCK')
                }

                const order = await tx.order.create({
                  data: {
                    customer: from,
                    total: product.price,
                    status: 'PENDING',
                    items: {
                      create: [{ productId: product.id, quantity: 1, price: product.price }]
                    }
                  }
                })

                await tx.product.update({
                  where: { id: product.id },
                  data: { stock: { decrement: 1 } }
                })

                await tx.inventoryLog.create({
                  data: { productId: product.id, action: 'RESERVED', quantity: 1 }
                })

                return { order, product }
              })
            } catch (err) {
              sessionService.clear(from)
              if (err.message === 'OUT_OF_STOCK') {
                await whatsappService.sendText(from, "❌ Sorry, that item just went out of stock.")
              } else {
                console.error('Order error:', err)
                await whatsappService.sendText(from, "⚠️ Something went wrong. Please try again.")
              }
              return res.sendStatus(200)
            }

            sessionService.clear(from)

            // const paymentLink = `${env.FRONTEND_URL}/pay/${result.order.id}`
            const paymentLink = `https://your-payment-link.com/pay/${result.order.id}`;

            await whatsappService.sendText(
              from,
              `✅ *Order Confirmed!*\n\n🧾 Order #${result.order.id.slice(-6)}\n📦 ${result.product.name}\n💰 KES ${result.product.price}\n\n👉 Complete payment here:\n${paymentLink}\n\n_Payment link expires in 30 minutes._`
            )

            return res.sendStatus(200)
          }

          // ── Cancel order ───────────────────────────────────────────
          if (buttonId.startsWith('cancel_')) {
            sessionService.clear(from)
            await whatsappService.sendText(
              from,
              "❌ Order cancelled.\n\nType *catalog* to browse again or *menu* for options."
            )
            return res.sendStatus(200)
          }

          // other button replies fall through to text handler below
          text = buttonId.toLowerCase()
        }

        if (!text || typeof text !== 'string') {
          return res.sendStatus(200);
        }

      // Greetings
      if (GREETINGS.some(g => text.startsWith(g))) {
        await whatsappService.sendText(from,
          `👋 Welcome to HisaFlow!\n\nReply with:\n• *catalog* — browse products\n• *orders* — view your orders\n• *help* — get support`
        )
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