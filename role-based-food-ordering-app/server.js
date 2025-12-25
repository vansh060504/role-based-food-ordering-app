require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Food Ordering API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      food: {
        getItems: 'GET /api/food/items',
        addItem: 'POST /api/food/items (Admin/Manager only)',
        updateItem: 'PUT /api/food/items/:id (Admin/Manager only)',
        createOrder: 'POST /api/food/orders',
        getOrders: 'GET /api/food/orders',
        updateOrderStatus: 'PATCH /api/food/orders/:id (Admin/Manager only)',
        updatePayment: 'PATCH /api/food/orders/:id/payment'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

module.exports = app;
