import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, token, logout, canAccessCartAndPayment, hasAccess } = useAuth();
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('order');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoodItems();
    fetchOrders();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch('/api/food/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setFoodItems(data.items);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/food/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(i => 
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!canAccessCartAndPayment()) {
      alert('You do not have access to cart and payment features based on your role and location.');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        food_item_id: item.id,
        quantity: item.quantity
      }));

      const response = await fetch('/api/food/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: orderItems,
          payment_method: paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order placed successfully!');
        setCart([]);
        fetchOrders();
        setActiveTab('orders');
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (err) {
      alert('Error placing order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Food Ordering System</h1>
        <div className="user-info">
          <span>Welcome, {user.name} ({user.role} - {user.location})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'order' ? 'active' : ''} 
          onClick={() => setActiveTab('order')}
        >
          Order Food
        </button>
        <button 
          className={activeTab === 'cart' ? 'active' : ''} 
          onClick={() => setActiveTab('cart')}
          disabled={!canAccessCartAndPayment()}
        >
          Cart ({cart.length})
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'order' && (
        <div className="food-items-grid">
          <h2>Available Food Items</h2>
          <div className="items-grid">
            {foodItems.map(item => (
              <div key={item.id} className="food-item-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="price">${item.price.toFixed(2)}</p>
                <button 
                  onClick={() => addToCart(item)} 
                  className="btn-add-to-cart"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="cart-section">
          <h2>Your Cart</h2>
          
          {!canAccessCartAndPayment() && (
            <div className="warning-message">
              You do not have access to cart and payment features based on your role and location.
            </div>
          )}

          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeFromCart(item.id)} className="btn-remove">Remove</button>
                    </div>
                    <div className="cart-item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="payment-method">
                  <label>Payment Method:</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
                <h3>Total: ${calculateTotal()}</h3>
                <button 
                  onClick={handleCheckout} 
                  className="btn-checkout"
                  disabled={!canAccessCartAndPayment()}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <span className={`status status-${order.status}`}>{order.status}</span>
                  </div>
                  <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                  <p>Payment Method: {order.payment_method}</p>
                  <p>Total: ${order.total_amount.toFixed(2)}</p>
                  <div className="order-items">
                    <h4>Items:</h4>
                    {order.items && order.items.map((item, index) => (
                      <p key={index}>
                        {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
