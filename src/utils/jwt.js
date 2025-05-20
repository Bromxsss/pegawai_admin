import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Generate JWT token
export const generateToken = (user) => {
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
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export default prisma;