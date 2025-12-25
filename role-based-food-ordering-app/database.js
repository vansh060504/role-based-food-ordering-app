const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./foodorder.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Manager', 'Member')),
      location TEXT NOT NULL CHECK(location IN ('India', 'America', 'Wakanda'))
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
      seedUsers();
    }
  });

  // Create food_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      available INTEGER DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('Error creating food_items table:', err.message);
    } else {
      console.log('Food items table ready');
      seedFoodItems();
    }
  });

  // Create orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating orders table:', err.message);
    } else {
      console.log('Orders table ready');
    }
  });

  // Create order_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating order_items table:', err.message);
    } else {
      console.log('Order items table ready');
    }
  });
}

function seedUsers() {
  db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
    if (err) {
      console.error('Error checking users:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding initial users...');
      
      const users = [
        { name: 'Captain Marvel', email: 'marvel@nick.fury', password: 'password123', role: 'Admin', location: 'India' },
        { name: 'Captain America', email: 'america@nick.fury', password: 'password123', role: 'Manager', location: 'America' },
        { name: 'Thanos', email: 'thanos@nick.fury', password: 'password123', role: 'Member', location: 'India' },
        { name: 'Thor', email: 'thor@nick.fury', password: 'password123', role: 'Member', location: 'Wakanda' },
        { name: 'Travis', email: 'travis@nick.fury', password: 'password123', role: 'Member', location: 'America' }
      ];

      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.run(
          'INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role, user.location],
          (err) => {
            if (err) {
              console.error(`Error inserting user ${user.name}:`, err.message);
            } else {
              console.log(`User ${user.name} created successfully`);
            }
          }
        );
      }
    }
  });
}

function seedFoodItems() {
  db.get('SELECT COUNT(*) as count FROM food_items', (err, row) => {
    if (err) {
      console.error('Error checking food items:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding initial food items...');
      
      const foodItems = [
        { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', price: 12.99 },
        { name: 'Chicken Burger', description: 'Grilled chicken burger with lettuce and mayo', price: 8.99 },
        { name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing', price: 7.99 },
        { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 11.99 },
        { name: 'Fish Tacos', description: 'Three tacos with grilled fish and salsa', price: 10.99 },
        { name: 'Veggie Wrap', description: 'Healthy wrap with mixed vegetables', price: 6.99 },
        { name: 'Steak Sandwich', description: 'Tender steak with caramelized onions', price: 14.99 },
        { name: 'Soup of the Day', description: 'Ask server for today\'s special', price: 5.99 }
      ];

      foodItems.forEach(item => {
        db.run(
          'INSERT INTO food_items (name, description, price) VALUES (?, ?, ?)',
          [item.name, item.description, item.price],
          (err) => {
            if (err) {
              console.error(`Error inserting food item ${item.name}:`, err.message);
            } else {
              console.log(`Food item ${item.name} added successfully`);
            }
          }
        );
      });
    }
  });
}

module.exports = db;
