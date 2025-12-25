# Food Ordering System - Role-Based Access Control

A full-stack web application for food ordering with role-based access control for Nick Fury's business with 5 employees.

## 🎯 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Manager, Member)
- Location-based restrictions for cart and payment access

### User Roles & Permissions

#### Admin (Full Access)
- View and order food items
- Add and update food items
- Access cart and checkout
- Pay and modify payment method
- View all orders

#### Manager (Full Access)
- View and order food items
- Add and update food items
- Access cart and checkout
- Pay and modify payment method
- View all orders

#### Member (Limited Access)
- View and order food items
- **Location-based cart/payment restrictions:**
  - **India**: Full access to cart and payment ✅
  - **America**: Cannot access cart and payment ❌
  - **Wakanda**: Cannot access cart and payment ❌

### Core Functionality
- Browse available food items
- Add items to cart
- Manage cart (add/remove items, update quantities)
- Select payment method (Credit Card, Debit Card, PayPal, Cash on Delivery)
- Place orders
- View order history
- Admin/Manager can view all orders
- Members can only view their own orders

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Routing
- **Context API** - State management
- **CSS3** - Styling

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🚀 Installation & Setup

### 1. Install Backend Dependencies

```bash
npm install
```

This will install:
- express
- cors
- bcryptjs
- jsonwebtoken
- sqlite3
- dotenv

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- react-scripts

### 3. Configure Environment Variables

The `.env` file is already created in the root directory with:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**Note:** For production, change the `JWT_SECRET` to a secure random string.

## 🎬 Running the Application

### Start Backend Server

From the root directory:
```bash
npm start
```

The backend server will start on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal and navigate to the client directory:
```bash
cd client
npm start
```

The React app will start on `http://localhost:3000`

## 👥 Demo Users

The application comes with pre-seeded users for testing:

| Name | Email | Password | Role | Location | Cart/Payment Access |
|------|-------|----------|------|----------|-------------------|
| Captain Marvel | marvel@nick.fury | password123 | Admin | India | ✅ Yes |
| Captain America | america@nick.fury | password123 | Manager | America | ✅ Yes |
| Thanos | thanos@nick.fury | password123 | Member | India | ✅ Yes |
| Thor | thor@nick.fury | password123 | Member | Wakanda | ❌ No |
| Travis | travis@nick.fury | password123 | Member | America | ❌ No |

## 📁 Project Structure

```
sde-assignment/
├── server.js                 # Express server entry point
├── database.js              # SQLite database setup and seeding
├── package.json             # Backend dependencies
├── .env                     # Environment variables
├── middleware/
│   └── auth.js             # JWT and role-based middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   └── food.js             # Food ordering routes
└── client/                  # React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── context/
        │   └── AuthContext.js    # Authentication context
        └── components/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── ProtectedRoute.js
            ├── Auth.css
            └── Dashboard.css
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Food Items
- `GET /api/food/items` - Get all available food items (All authenticated users)
- `POST /api/food/items` - Add new food item (Admin/Manager only)
- `PUT /api/food/items/:id` - Update food item (Admin/Manager only)

### Orders
- `GET /api/food/orders` - Get orders (Members see own, Admin/Manager see all)
- `POST /api/food/orders` - Create order (with location restrictions)
- `PATCH /api/food/orders/:id` - Update order status (Admin/Manager only)
- `PATCH /api/food/orders/:id/payment` - Update payment method (with location restrictions)

## 🔐 Access Control Matrix

| Function | Admin | Manager | Member (India) | Member (America) | Member (Wakanda) |
|----------|-------|---------|----------------|------------------|------------------|
| View Restaurants & Menu | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Order | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Food Items | ✅ | ✅ | ❌ | ❌ | ❌ |
| Checkout (Cart & Pay) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modify Payment Method | ✅ | ✅ | ✅ | ❌ | ❌ |
| Place Order | ✅ | ✅ | ✅ | ❌ | ❌ |

## 🧪 Testing the Application

### Test Scenario 1: Admin/Manager Access
1. Login as Captain Marvel (Admin) or Captain America (Manager)
2. All features including cart, payment, and checkout should be accessible
3. Can view all orders from all users

### Test Scenario 2: Member from India
1. Login as Thanos (Member from India)
2. Should have full access to cart and payment features
3. Can only view their own orders

### Test Scenario 3: Member from America/Wakanda
1. Login as Thor (Wakanda) or Travis (America)
2. Can browse food items and add to cart
3. Cart tab should be disabled
4. Attempting to checkout will show access denied message

## 🗄️ Database Schema

### Users Table
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT UNIQUE)
- password (TEXT - hashed)
- role (TEXT: Admin, Manager, Member)
- location (TEXT: India, America, Wakanda)
```

### Food Items Table
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- price (REAL)
- available (INTEGER: 0 or 1)
```

### Orders Table
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- status (TEXT: pending, completed, cancelled)
- total_amount (REAL)
- payment_method (TEXT)
- created_at (DATETIME)
```

### Order Items Table
```sql
- id (INTEGER PRIMARY KEY)
- order_id (INTEGER)
- food_item_id (INTEGER)
- quantity (INTEGER)
- price (REAL)
```

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs
2. **JWT Tokens**: Secure token-based authentication with 24-hour expiry
3. **Role-Based Middleware**: Server-side enforcement of role restrictions
4. **Location-Based Access Control**: Automatic restriction based on user location
5. **Protected Routes**: Frontend routes protected with authentication checks

## 📝 Additional Notes

- The SQLite database file (`foodorder.db`) will be created automatically when you first run the backend server
- The database is seeded with sample users and food items on first run
- Frontend uses a proxy configuration to route API calls to the backend
- The application is fully responsive and works on mobile devices

## 🐛 Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check if all dependencies are installed: `npm install`

### Frontend won't start
- Navigate to client directory: `cd client`
- Install dependencies: `npm install`
- Make sure port 3000 is available

### Database errors
- Delete `foodorder.db` file and restart the backend to recreate the database

### Authentication issues
- Clear browser local storage
- Check if JWT_SECRET is set in .env file

## 📄 License

This project is for educational purposes as part of an SDE assignment.

## 👨‍💻 Author

Built as a full-stack assignment demonstrating role-based access control in a web application.
