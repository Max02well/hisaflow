import express from 'express'
import { mpesaController } from '../controllers/mpesa.controller.js'

const router = express.Router()

router.post('/callback', mpesaController.handleCallback)

export default router