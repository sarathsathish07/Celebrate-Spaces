import expressAsyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import { fetchAcceptedHotels } from '../services/hotelService.js';
import { generateToken } from '../services/userService.js';
import User from '../models/userModel.js';
import Wallet from '../models/walletModel.js';
import RatingReview from '../models/ratingReviewModel.js';
import Booking from '../models/bookingModel.js';
import Notification from '../models/notificationModel.js';

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.authenticateUser(email, password);
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});
const googleLogin = async (req, res) => {
  const name = req.body.googleName;
  const email = req.body.googleEmail;
  const user = await User.findOne({ email });

  if (user) {
    if (user.isBlocked === false) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: 'User is blocked or not authorized' });
      return;
    }
  } else {
    const newUser = await User.create({
      name,
      email,
    });
    if (newUser) {
      generateToken(res, newUser._id);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  }
};


const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, userExists, message } = await userService.registerNewUser(name, email, password);
    if (userExists) {
      res.status(200).json({
        message,
        otpSent: true,
      });
    } else {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        otpSent: true,
        message,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const verifyOtp = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const message = await userService.verifyUserOtp(email, otp);
    res.status(200).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const resendOtp = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await userService.resendOtp(email);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const logoutUser = expressAsyncHandler((req, res) => {
  const message = userService.logoutUser(res);
  res.status(200).json(message);
});

const getUserProfile = expressAsyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  res.status(200).json(user);
});

const updateUserProfile = expressAsyncHandler(async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = req.file;
    }

    const updatedUser = await userService.updateUserProfileService(
      req.user._id,
      updateData,
      req.file
    );

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImageName: updatedUser.profileImageName,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const getHotels = async (req, res) => {
  try {
    const { sort = '', amenities = '', city = '' } = req.query;
    const amenitiesArray = amenities ? amenities.split(',') : [];
    const hotels = await fetchAcceptedHotels(sort, amenitiesArray, city);
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getHotelById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const hotel = await userService.getSingleHotelById(id);
  if (hotel) {
    res.status(200).json(hotel);
  } else {
    res.status(404).json({ message: 'Hotel not found' });
  }
});

const sendPasswordResetEmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const response = await userService.sendPasswordResetEmailService(email, req);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const resetPassword = expressAsyncHandler(async (req, res) => {
  const resetToken = req.params.token;
  const { password } = req.body;

  try {
    const response = await userService.resetPasswordService(resetToken, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getWalletTransactions = expressAsyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });

  if (!wallet) {
    return res.json([]);
  }

  res.json(wallet.transactions);
});

const addCashToWallet = expressAsyncHandler(async (req, res) => {
  let { amount } = req.body;

  amount = Number(amount);

  if (amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  let wallet = await Wallet.findOne({ user: req.user._id });

  if (!wallet) {
    wallet = new Wallet({
      user: req.user._id,
      balance: 0,
      transactions: [],
    });
  }

  wallet.balance += amount;

  const newTransaction = {
    user: req.user._id,
    amount,
    transactionType: 'credit',
  };

  wallet.transactions.push(newTransaction);
  await wallet.save();

  res.status(201).json(newTransaction);
});

const getWalletBalance = expressAsyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    return res.json({ balance: 0 });
  }
  res.json({ balance: wallet.balance });
});
const addReview = expressAsyncHandler(async (req, res) => {
  const { rating, review, bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate('userId hotelId');

  if (booking) {
    const newReview = new RatingReview({
      userId: booking.userId._id,
      hotelId: booking.hotelId._id,
      rating,
      review,
      bookingId: booking._id
    });

    await newReview.save();

    res.status(201).json(newReview);
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});
const getReviews = expressAsyncHandler(async (req, res) => {
  const reviews = await RatingReview.find({ hotelId: req.params.hotelId })
    .populate('userId', 'name')
  res.json(reviews);
});
const getBookingReviews = expressAsyncHandler(async (req, res) => {
  const reviews = await RatingReview.find().populate('userId', 'name').populate('hotelId', 'name');
  res.json(reviews);
});


const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const today = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const diffHours = Math.ceil((checkInDate - today) / (1000 * 60 * 60));
    
    let refundPercentage = 0;

    if (diffHours > 48) {
      refundPercentage = 100;
    } else if (diffHours >= 24) {
      refundPercentage = 50;
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    const wallet = await Wallet.findOne({ user: booking.userId });
    const refundAmount = (booking.totalAmount * refundPercentage) / 100;
    wallet.balance += refundAmount;
    wallet.transactions.push({
      user: booking.userId,
      amount: refundAmount,
      transactionType: 'credit',
    });
    await wallet.save();

    res.status(200).json({ message: `Booking successfully cancelled and ${refundPercentage}% amount refunded to wallet` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

 const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user._id; 
    const notifications = await Notification.find({
      readBy: { $ne: userId },
    }).sort({ createdAt: -1 }); 
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; 
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.readBy.includes(userId)) {
      return res.status(400).json({ message: 'Notification already marked as read' });
    }

    notification.readBy.push(userId);
    await notification.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





export {
  authUser, 
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyOtp,
  getHotels,
  resendOtp,
  getHotelById,
  sendPasswordResetEmail,
  resetPassword,
  googleLogin,
  getWalletTransactions,
  addCashToWallet,
  getWalletBalance,
  addReview,
  getReviews,
  getBookingReviews,
  cancelBooking,
  getUnreadNotifications,
  markNotificationAsRead 
};
