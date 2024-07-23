import expressAsyncHandler from 'express-async-handler';
import * as adminService from '../services/adminService.js';
import { generateAdminToken } from '../services/adminService.js';
import User from '../models/userModel.js';
import Hotel from '../models/hotelModel.js';
import Hotelier from '../models/hotelierModel.js';
import Booking from '../models/bookingModel.js';

const authAdmin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await adminService.authenticateAdmin(email, password);
    generateAdminToken(res, admin._id);
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
    });
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});


const logoutAdmin = expressAsyncHandler(async (req, res) => {
  const message =  adminService.logoutAdmin(res);
  res.status(200).json(message);
});

const getAllUsers = expressAsyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers();
  res.status(200).json(users);
});

const updateUser = expressAsyncHandler(async (req, res) => {
  const { userId, name, email } = req.body;
  const updatedUser = await adminService.updateUser(userId, { name, email });
  res.status(200).json(updatedUser);
});


const getVerificationDetails = expressAsyncHandler(async (req, res) => {
  const hotels = await adminService.getVerificationDetails();
  res.status(200).json(hotels);
});

const acceptVerification = expressAsyncHandler(async (req, res) => {
  try {
    await adminService.acceptVerification(req.params.hotelId);
    res.json({ message: 'Verification accepted' });
  } catch (error) {
    console.error('Error accepting verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const rejectVerification = expressAsyncHandler(async (req, res) => {
  try {
    const { adminId } = req.params; 
    const { reason } = req.body;  

    await adminService.rejectVerification(adminId, reason); 
    res.json({ message: 'Verification rejected' });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


const blockUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  const message = await adminService.blockUser(userId);
  res.status(200).json(message);
});

const unblockUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  const message = await adminService.unblockUser(userId);
  res.status(200).json(message);
});
const getAllHotels = expressAsyncHandler(async (req, res) => {
  const hotels = await adminService.getAllHotels();
  res.status(200).json(hotels);
});
const listHotel = expressAsyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const result = await adminService.listHotel(hotelId);
  res.status(200).json(result);
});

const unlistHotel = expressAsyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const result = await adminService.unlistHotel(hotelId);
  res.status(200).json(result);
});
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHoteliers = await Hotelier.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    const monthlyBookings = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: {
            month: { $month: "$bookingDate" },
            year: { $year: "$bookingDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const yearlyBookings = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: { year: { $year: "$bookingDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1 } }
    ]);

    res.json({
      totalUsers,
      totalHoteliers,
      totalHotels,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      monthlyBookings: monthlyBookings.map(({ _id, count }) => ({
        month: `${_id.year}-${_id.month.toString().padStart(2, '0')}`,
        count
      })),
      yearlyBookings: yearlyBookings.map(({ _id, count }) => ({ year: _id.year, count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



export {
  authAdmin,
  logoutAdmin,
  getAllUsers,
  updateUser,
  getVerificationDetails,
  acceptVerification,
  rejectVerification,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel,
  getAdminStats
};
