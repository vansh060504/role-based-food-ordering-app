const jwt = require('jsonwebtoken');

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Check if user has required role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user?.role
      });
    }
    next();
  };
};

// Check location-based restrictions for Team Members
const checkLocationRestrictions = (req, res, next) => {
  const { role, location } = req.user;
  
  // Admin and Manager have full access
  if (role === 'Admin' || role === 'Manager') {
    return next();
  }
  
  // Team Members in America or Wakanda cannot access cart/payment
  if (role === 'Member' && (location === 'America' || location === 'Wakanda')) {
    return res.status(403).json({ 
      message: 'Team Members from America and Wakanda do not have access to cart and payment features.',
      role: role,
      location: location
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkLocationRestrictions
};
