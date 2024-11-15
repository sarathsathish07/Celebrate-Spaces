import expressAsyncHandler from 'express-async-handler';
import * as adminService from '../services/adminService.js';
import { generateAdminToken } from '../services/adminService.js';
import User from '../models/userModel.js';
import Hotel from '../models/hotelModel.js';
import Hotelier from '../models/hotelierModel.js';
import Booking from '../models/bookingModel.js';
import Notification from '../models/notificationModel.js';

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

  const getSalesReport = async (req, res) => {
    const { from, to } = req.body;

    try {
      if (!from || !to) {
        return res.status(400).json({ message: 'Date range is required' });
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const bookings = await Booking.aggregate([
        {
          $match: {
            bookingDate: { $gte: fromDate, $lte: toDate },
            bookingStatus: 'confirmed',
          }
        },
        {
          $lookup: {
            from: 'hotels', 
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel'
          }
        },
        {
          $lookup: {
            from: 'users', 
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'rooms', 
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
          }
        },
        {
          $unwind: { path: '$hotel', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$room', preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
            totalSales: { $sum: "$totalAmount" },
            userName: { $first: "$user.name" }, 
            hotelName: { $first: "$hotel.name" }, 
            roomName: { $first: "$room.type" }, 
            checkInDate: { $first: "$checkInDate" },
            checkOutDate: { $first: "$checkOutDate" },
            paymentMethod: { $first: "$paymentMethod" },
            paymentStatus: { $first: "$paymentStatus" },
            bookingStatus: { $first: "$bookingStatus" },
            hotelierId: { $first: "$hotelierId" },
            roomsBooked: { $first: "$roomsBooked" },
            paymentId: { $first: "$paymentId" },
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  // const sendNotification = expressAsyncHandler(async (req, res) => {
  //   const { message } = req.body;
    
  //   const notification = new Notification({ message });
  //   await notification.save();
  //   const io = req.app.get('io');
  //   io.emit('newNotification', notification);
    
  //   res.status(201).json({ message: 'Notification sent' });
  // });





export {
  authAdmin,
  logoutAdmin,
  getAllUsers,
  getVerificationDetails,
  acceptVerification,
  rejectVerification,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel,
  getAdminStats,
  getSalesReport,

};
