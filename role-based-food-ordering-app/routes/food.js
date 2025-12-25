const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRoles, checkLocationRestrictions } = require('../middleware/auth');

// Get all food items (accessible by all authenticated users)
router.get('/items', authenticateToken, (req, res) => {
  db.all('SELECT * FROM food_items WHERE available = 1', [], (err, items) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.json({ items });
  });
});

// Add food item (Admin and Manager only)
router.post('/items', authenticateToken, authorizeRoles('Admin', 'Manager'), (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  db.run(
    'INSERT INTO food_items (name, description, price) VALUES (?, ?, ?)',
    [name, description, price],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      res.status(201).json({
        message: 'Food item added successfully',
        item: { id: this.lastID, name, description, price, available: 1 }
      });
    }
  );
});

// Update food item (Admin and Manager only)
router.put('/items/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), (req, res) => {
  const { id } = req.params;
  const { name, description, price, available } = req.body;

  db.run(
    'UPDATE food_items SET name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price), available = COALESCE(?, available) WHERE id = ?',
    [name, description, price, available, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Food item not found' });
      }
      res.json({ message: 'Food item updated successfully' });
    }
  );
});

// Create order (with location restrictions for Members)
router.post('/orders', authenticateToken, checkLocationRestrictions, (req, res) => {
  const { items, payment_method } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  if (!payment_method) {
    return res.status(400).json({ message: 'Payment method is required' });
  }

  // Calculate total amount
  let totalAmount = 0;
  const itemPromises = items.map(item => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM food_items WHERE id = ? AND available = 1', [item.food_item_id], (err, foodItem) => {
        if (err) {
          reject(err);
        } else if (!foodItem) {
          reject(new Error(`Food item ${item.food_item_id} not found or unavailable`));
        } else {
          totalAmount += foodItem.price * item.quantity;
          resolve({ ...item, price: foodItem.price });
        }
      });
    });
  });

  Promise.all(itemPromises)
    .then(validatedItems => {
      // Create order
      db.run(
        'INSERT INTO orders (user_id, status, total_amount, payment_method) VALUES (?, ?, ?, ?)',
        [userId, 'pending', totalAmount, payment_method],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
          }

          const orderId = this.lastID;

          // Insert order items
          const orderItemsPromises = validatedItems.map(item => {
            return new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO order_items (order_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.food_item_id, item.quantity, item.price],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          Promise.all(orderItemsPromises)
            .then(() => {
              res.status(201).json({
                message: 'Order created successfully',
                order: {
                  id: orderId,
                  user_id: userId,
                  status: 'pending',
                  total_amount: totalAmount,
                  payment_method,
                  items: validatedItems
                }
              });
            })
            .catch(err => {
              res.status(500).json({ message: 'Error creating order items', error: err.message });
            });
        }
      );
    })
    .catch(err => {
      res.status(400).json({ message: err.message });
    });
});

// Get user's orders
router.get('/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { role } = req.user;

  let query = 'SELECT * FROM orders';
  let params = [];

  // Members can only see their own orders, Admin and Manager can see all
  if (role === 'Member') {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT oi.*, fi.name, fi.description 
           FROM order_items oi 
           JOIN food_items fi ON oi.food_item_id = fi.id 
           WHERE oi.order_id = ?`,
          [order.id],
          (err, items) => {
            if (err) {
              reject(err);
            } else {
              resolve({ ...order, items });
            }
          }
        );
      });
    });

    Promise.all(ordersWithItems)
      .then(result => {
        res.json({ orders: result });
      })
      .catch(err => {
        res.status(500).json({ message: 'Error fetching order items', error: err.message });
      });
  });
});

// Update order status (Admin and Manager only)
router.patch('/orders/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

// Update payment method (with location restrictions)
router.patch('/orders/:id/payment', authenticateToken, checkLocationRestrictions, (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;
  const userId = req.user.id;
  const { role } = req.user;

  if (!payment_method) {
    return res.status(400).json({ message: 'Payment method is required' });
  }

  // Members can only update their own orders
  let query = 'UPDATE orders SET payment_method = ? WHERE id = ?';
  let params = [payment_method, id];

  if (role === 'Member') {
    query += ' AND user_id = ?';
    params.push(userId);
  }

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }
    res.json({ message: 'Payment method updated successfully' });
  });
});

module.exports = router;
