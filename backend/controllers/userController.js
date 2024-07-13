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
    console.log('Received sort:', sort);
    console.log('Received amenities:', amenitiesArray);
    console.log('Received city:', city);
    const hotels = await fetchAcceptedHotels(sort, amenitiesArray, city);
    console.log('Fetched hotels:', hotels);
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





const getHotelById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const hotel = await userService.getSingleHotelById(id);
  console.log(hotel);
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
  resetPassword
};
