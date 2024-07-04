import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import Hotelier from '../models/hotelierModel.js';

const protect = expressAsyncHandler(async (req, res, next) => {
  const token = req.cookies.jwtHotelier;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_HOTELIER);
    req.hotelier = await Hotelier.findById(decoded.userId).select('-password');

    if (!req.hotelier) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
});

export { protect };
