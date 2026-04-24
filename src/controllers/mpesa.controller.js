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

            const amount = metadata.find(i => i.Name === "Amount")?.Value
            const phone = metadata.find(i => i.Name === "PhoneNumber")?.Value
            const reference = metadata.find(i => i.Name === "AccountReference")?.Value

            const orderId = reference?.replace("ORDER-", "")

            if (resultCode === 0) {
                // SUCCESS

                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
                        paymentMethod: 'MPESA',
                        paymentId: mpesaReceiptNumber,
                    },
                })

                await whatsappService.sendText(
                    phone,
                    `🎉 *Payment Received!*\n\n✅ KES ${order.total} confirmed\n🧾 ${order.orderNumber}\n📋 M-Pesa Ref: ${mpesaReceiptNumber}\n\nYour order is being prepared. We'll notify you when it ships!`
                )

            } else {
                // FAILED

                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: "CANCELLED", paymentStatus: "FAILED" }
                })

                // Release stock back
                    const item = order.items?.[0]
                    if (item) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    })
                    }

                await whatsappService.sendText(
                    phone,
                    `❌ Payment failed..\n\nType *catalog* to view our products and try again.`
                )
            }

            res.sendStatus(200)

        } catch (err) {
            console.error("MPESA CALLBACK ERROR:", err)
            res.sendStatus(200)
        }
    }
}