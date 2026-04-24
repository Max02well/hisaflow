import { prisma } from '../services/prisma.service.js'
import { whatsappService } from '../services/whatsapp.service.js'

export const mpesaController = {

    async handleCallback(req, res) {
        try {
            const body = req.body
            const callback = body.Body?.stkCallback

            if (!callback) return res.sendStatus(200)

            const resultCode = callback.ResultCode
            const metadata = callback.CallbackMetadata?.Item || []

            // ── Extract all metadata fields ──────────────────────────────
            const amount = metadata.find(i => i.Name === 'Amount')?.Value
            const phone = String(metadata.find(i => i.Name === 'PhoneNumber')?.Value || '')
            const mpesaReceiptNumber = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value
            const reference = metadata.find(i => i.Name === 'AccountReference')?.Value

            const orderId = reference?.replace('ORDER-', '')

            if (!orderId) {
                console.error('No orderId found in callback reference:', reference)
                return res.sendStatus(200)
            }

            if (resultCode === 0) {
                // ── SUCCESS ─────────────────────────────────────────────────

                // Fetch order first so we have orderNumber and items for messaging
                const order = await prisma.order.findUnique({    // ← was missing, used below
                    where: { id: orderId },
                    include: { items: { include: { product: true } } }
                })

                if (!order) {
                    console.error('Order not found for id:', orderId)
                    return res.sendStatus(200)
                }

                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
                        paymentMethod: 'MPESA',
                        paymentId: mpesaReceiptNumber,   // ← now defined
                    }
                })

                await whatsappService.sendText(
                    order.customer,                    // ← use order.customer, not phone (more reliable)
                    `🎉 *Payment Received!*\n\n✅ KES ${order.total} confirmed\n🧾 ${order.orderNumber}\n📋 M-Pesa Ref: ${mpesaReceiptNumber}\n\nYour order is being prepared. We'll notify you when it ships! 🚀`
                )

            } else {
                // ── FAILED / CANCELLED ───────────────────────────────────────

                // Fetch order with items so we can release stock
                const order = await prisma.order.findUnique({    // ← was missing
                    where: { id: orderId },
                    include: { items: true }
                })

                if (!order) {
                    console.error('Order not found for id:', orderId)
                    return res.sendStatus(200)
                }

                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'CANCELLED', paymentStatus: 'FAILED' }
                })

                // Release reserved stock for each item
                for (const item of order.items) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    })
                }

                await whatsappService.sendText(
                    order.customer,
                    `❌ Payment failed or was cancelled.\n\nType *catalog* to browse again or *pay ${order.orderNumber}* to retry payment.`
                )
            }

            return res.sendStatus(200)

        } catch (err) {
            console.error('MPESA CALLBACK ERROR:', err)
            return res.sendStatus(200)
        }
    }
}