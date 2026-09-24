import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import menuRoutes from './routes/menuRoutes.js';
import ingredientsRoutes from './routes/ingredientsRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import transferControllerRoutes from './routes/transferControllerRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cors());

// Real-time WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_store', (storeId) => {
    socket.join(`store_${storeId}`);
    console.log(`📌 Socket ${socket.id} joined room store_${storeId}`);
  });

  socket.on('leave_store', (storeId) => {
    socket.leave(`store_${storeId}`);
    console.log(`👋 Socket ${socket.id} left room store_${storeId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfer', transferControllerRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Autonomous Inventory Redistribution Engine',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Autonomous Kitchen Server running on port ${PORT}`);
  console.log(`📡 Socket.IO Real-time Engine initialized.`);
});
