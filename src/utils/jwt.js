import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-default-secret-key';
const EXPIRES_IN = '1d'; // Token expiration time

export const jwttoken = {
   sign:(payload) => {
    try {
      return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
    } catch (error) {
      logger.error('Error signing JWT token:', error);
      throw new Error('Failed to sign JWT token');
    }
  },

  verify:(token) => {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      logger.error('Error verifying JWT token:', error);
      throw new Error('Invalid or expired JWT token');
    }
  }
};  