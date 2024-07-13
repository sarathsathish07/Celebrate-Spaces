import asyncHandler from 'express-async-handler';
import * as adminRepository from '../repositories/adminRepository.js';
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sarathsathish77@gmail.com',
    pass: 'pehs ltsj iktw pqtp',
  },
});
const generateAdminToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: "30d",
  });

  res.cookie("jwtAdmin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 *100
  });
};

const authenticateAdmin = asyncHandler(async (email, password) => {
  return await adminRepository.findAdminByEmailAndPassword(email, password);
});

const logoutAdmin = asyncHandler(async (res) => {
  res.cookie('jwtAdmin', '', {
    httpOnly: true,
    expires: new Date(),
  });
  return { message: 'Admin logged out' };
});

const getAllUsers = asyncHandler(async () => {
  return  adminRepository.getAllUsers();
});
const blockUser = asyncHandler(async (userId) => {
  const user = await adminRepository.updateUser(userId, { isBlocked: true });
  return { message: 'User blocked successfully' };
});

const unblockUser = asyncHandler(async (userId) => {
  const user = await adminRepository.updateUser(userId, { isBlocked: false });
  return { message: 'User unblocked successfully' };
});
const getAllHotels = asyncHandler(async () => {
  return await adminRepository.getAllHotels();
});
const listHotel = asyncHandler(async (hotelId) => {
  return await adminRepository.listHotel(hotelId);
});

const unlistHotel = asyncHandler(async (hotelId) => {
  return await adminRepository.unlistHotel(hotelId);
});


const getVerificationDetails = async () => {
  return await adminRepository.getPendingHotelierVerifications();
};

const acceptVerification = async (hotelId) => {
  const hotel = await adminRepository.findHotelById(hotelId);
  if (!hotel) {
    throw new Error('Hotel not found');
  }
  hotel.verificationStatus = 'accepted';
  await adminRepository.saveHotel(hotel);
  const hotelier = await adminRepository.findHotelierById(hotel.hotelierId);
    if (!hotelier) {
      return res.status(404).json({ message: 'Hotelier not found' });
    }
  await sendVerificationEmail(hotelier.email, 'Verification Accepted', 'Your verification request has been accepted.');
};

const rejectVerification = async (hotelId, reason) => {
  const hotel = await adminRepository.findHotelById(hotelId);
  if (!hotel) {
    throw new Error('Hotelier not found');
  }
  hotel.verificationStatus = 'rejected';
  await adminRepository.saveHotel(hotel);
  const hotelier = await adminRepository.findHotelierById(hotel.hotelierId);
  if (!hotelier) {
    throw new Error('Hotelier not found');
  }
  const message = `Your verification request has been rejected for the following reason: ${reason}`;
  await sendVerificationEmail(hotelier.email, 'Verification Rejected', message);
};


const sendVerificationEmail = async (recipient, subject, message) => {
  try {
    await transporter.sendMail({
      from: 'sarathsathish77@gmail.com',
      to: recipient,
      subject: subject,
      text: message,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};


export {
  authenticateAdmin,
  logoutAdmin,
  sendVerificationEmail,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel,
  getAllUsers,
  getVerificationDetails,
  generateAdminToken,
  acceptVerification,
  rejectVerification
};
