import expressAsyncHandler from "express-async-handler";
import {
  authHotelier,
  registerHotelier,
  verifyHotelierOtp,
  logoutHotelier,
  getHotelierProfile,
  updateHotelierProfile,
  uploadCertificates,
  addHotel,
  getHotels,
  getHotelById,
  updateHotelData,
  resendOtp
} from '../services/hotelService.js';
import generateHotelierToken from "../utils/generateHotelierToken.js";
import Hotel from "../models/hotelModel.js";
import Booking from "../models/bookingModel.js";
import Message from '../models/messageModel.js';
import ChatRoom from '../models/chatRoomModel.js';
import Room from "../models/roomModel.js";
import HotelierNotification from "../models/hotelierNotifications.js";



const authHotelierHandler = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authHotelier(email, password);
    generateHotelierToken(res, user._id);
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

const registerHotelierHandler = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, userExists, message } = await registerHotelier(name, email, password);
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
    res.status(400);
    throw new Error(error.message);
  }
});

const verifyHotelierOtpHandler = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const message = await verifyHotelierOtp(email, otp);
    res.status(200).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const resendHotelierOtpHandler = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await resendOtp(email);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const logoutHotelierHandler = expressAsyncHandler(async (req, res) => {
  const response = await logoutHotelier(res);
  res.status(200).json(response);
});

const getHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  const user = await getHotelierProfile(req.hotelier._id);
  res.status(200).json(user);
});

const updateHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  try {
    const updatedHotelier = await updateHotelierProfile(
      req.hotelier._id,
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

const uploadVerificationDetailsHandler = expressAsyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;
  const certificatePath = req.file.path;

  try {
    await uploadCertificates(hotelId, certificatePath);
    res.status(200).json({ message: 'Verification details submitted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

const addHotelHandler = expressAsyncHandler(async (req, res) => {
  const { name, city, address, description, amenities,latitude, longitude } = req.body;
  const images = req.files.map((file) => file.path);

  const response = await addHotel(req.hotelier._id, {
    name,
    city,
    address,
    images,
    description,
    amenities: amenities.split(",").map((amenity) => amenity.trim()),
    latitude,
    longitude,
    isListed: true,
  });
  res.status(response.status).json(response.data);
});

const getHotelsHandler = async (req, res) => {  
  try {
    const hotels = await Hotel.find({ hotelierId: req.hotelier._id });

    const hotelData = await Promise.all(
      hotels.map(async (hotel) => {
        const chatRooms = await ChatRoom.find({ hotelId: hotel._id });

        const chatRoomIds = chatRooms.map(chatRoom => chatRoom._id);

        const unreadMessagesCount = await Message.countDocuments({
          chatRoomId: { $in: chatRoomIds },
          senderType: 'User',
          read: false,
        });

        return {
          ...hotel._doc,
          unreadMessagesCount,
        };
      })
    );

    res.json(hotelData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};



const getHotelByIdHandler = expressAsyncHandler(async (req, res) => {
  console.log("5: Handler called");
  
  try {
    const hotel = await Hotel.findById(req.params.id);
    console.log("Hotel fetched:", hotel);
    
    if (!hotel) {
      console.log("Hotel not found");
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotelId: hotel._id });
    console.log("Rooms fetched:", rooms);

    const chatRooms = await ChatRoom.find({ hotelId: hotel._id });
    console.log("Chat rooms fetched:", chatRooms);

    const chatRoomIds = chatRooms.map(chatRoom => chatRoom._id);
    console.log("Chat room IDs:", chatRoomIds);

    const unreadMessagesCount = await Message.countDocuments({
      chatRoomId: { $in: chatRoomIds },
      senderType: 'User',
      read: false,
    });

    console.log("Unread messages count:", unreadMessagesCount);

    const hotelDetails = {
      ...hotel.toObject(),
      rooms,
      unreadMessagesCount,
    };

    res.json(hotelDetails);
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

const updateHotelHandler = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedHotel = await updateHotelData(id, updateData,req.files);
    res.status(200).json(updatedHotel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hotel', error: error.message });
  }
};
const getHotelierStats = async (req, res) => {
  try {
    const hotelierId = req.hotelier._id;

    const totalHotels = await Hotel.countDocuments({ hotelierId });
    const totalBookings = await Booking.countDocuments({ hotelierId, bookingStatus: 'confirmed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { hotelierId, bookingStatus: 'confirmed' } },
      { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]);

    const monthlyBookings = await Booking.aggregate([
      { $match: { hotelierId, bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: {
            month: { $month: "$bookingDate" },
            year: { $year: "$bookingDate" }
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const yearlyBookings = await Booking.aggregate([
      { $match: { hotelierId, bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: { year: { $year: "$bookingDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1 } }
    ]);

    res.json({
      totalHotels,
      totalBookings,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0,
      monthlyBookings: monthlyBookings.map(({ _id, count }) => ({
        month: `${_id.year}-${_id.month.toString().padStart(2, '0')}`,
        count
      })),
      yearlyBookings: yearlyBookings.map(({ _id, count }) => ({ year: _id.year, count }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
const getHotelierSalesReport = async (req, res) => {
  const { from, to } = req.body;
  const hotelierId = req.hotelier._id;

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
          hotelierId: hotelierId
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotelId',
          foreignField: '_id',
          as: 'hotelDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'roomDetails'
        }
      },
      {
        $unwind: '$hotelDetails'
      },
      {
        $unwind: '$userDetails'
      },
      {
        $unwind: '$roomDetails'
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
          totalSales: { $sum: '$totalAmount' },
          userName: { $first: '$userDetails.name' },
          hotelName: { $first: '$hotelDetails.name' },
          roomName: { $first: '$roomDetails.type' },
          checkInDate: { $first: '$checkInDate' },
          checkOutDate: { $first: '$checkOutDate' },
          paymentMethod: { $first: '$paymentMethod' },
          bookingStatus: { $first: '$bookingStatus' }
        }
      }
    ]);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUnreadHotelierNotifications = async (req, res) => {
  try {
    const notifications = await HotelierNotification.find({ hotelierId: req.hotelier._id, isRead: false }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const markHotelierNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await HotelierNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.hotelierId.toString() !== req.hotelier._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





export {
  authHotelierHandler,
  registerHotelierHandler,
  verifyHotelierOtpHandler,
  logoutHotelierHandler,
  getHotelierProfileHandler,
  updateHotelierProfileHandler,
  uploadVerificationDetailsHandler,
  addHotelHandler,
  getHotelsHandler,
  getHotelByIdHandler,
  updateHotelHandler,
  resendHotelierOtpHandler,
  getHotelierStats,
  getHotelierSalesReport,
  getUnreadHotelierNotifications,
  markHotelierNotificationAsRead
};
