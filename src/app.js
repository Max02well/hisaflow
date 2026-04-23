import express from 'express';
import cors from 'cors';
import whatsappRoutes from './routes/whatsapp.routes';
import inventoryRoutes from './routes/inventory.routes';
import orderRoutes from './routes/order.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorMiddleware);

export default app;