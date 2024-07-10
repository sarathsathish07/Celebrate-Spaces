import expressAsyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import { fetchAcceptedHotels } from '../services/hotelService.js';
import { generateToken } from '../services/userService.js';

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
    const updatedHotelier = await userService.updateUserProfile(
      req.user._id,
      req.body,
      req.file
    );
    res.status(200).json({
      _id: updatedHotelier._id,
      name: updatedHotelier.name,
      email: updatedHotelier.email,
      profileImageName: updatedHotelier.profileImageName
    });
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

const getHotels = async (req, res) => {
  try {
    const hotels = await fetchAcceptedHotels();
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
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
  resendOtp
};
