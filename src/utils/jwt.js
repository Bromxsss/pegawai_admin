const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id_user, 
      level: user.level,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};