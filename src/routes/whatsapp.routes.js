import express from 'express';
import { whatsappController } from '../controllers/whatsapp.controller.js';
import { env } from '../config/env.js';

const router = express.Router();

// Meta webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Incoming messages from customers/Receive messages from WhatsApp
router.post('/webhook', whatsappController.handleIncomingMessage);

export default router;