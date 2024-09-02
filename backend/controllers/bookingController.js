import asyncHandler from 'express-async-handler';
import { checkAvailability,createBooking,updateBookingStatusService,getBookingsByUserIdService,getHotelierBookingsService,getAllBookingsService } from '../services/bookingService.js';
import Wallet from '../models/walletModel.js';
import Notification from '../models/notificationModel.js';
import Hotel from '../models/hotelModel.js';
import HotelierNotification from '../models/hotelierNotifications.js';

const saveBooking = asyncHandler(async (req, res) => {
  const bookingData = {
    userId: req.user._id,
    ...req.body,
    bookingDate: Date.now(),
    bookingStatus: req.body.paymentStatus === 'completed' ? 'confirmed' : 'pending',
  };

  if (req.body.paymentMethod === 'wallet') {
    bookingData.paymentStatus = 'completed';
    bookingData.bookingStatus = 'confirmed';

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < req.body.totalAmount) {
      res.status(400);
      throw new Error('Insufficient wallet balance');
    }

    wallet.balance -= req.body.totalAmount;
    const newTransaction = {
      user: req.user._id,
      amount: req.body.totalAmount,
      transactionType: 'debit',
    };
    wallet.transactions.push(newTransaction);
    await wallet.save();

    const userNotification = new Notification({
      userId: req.user._id,
      message: `Your booking has been confirmed via wallet payment.`,
      createdAt: new Date(),
      isRead: false,
    });
    await userNotification.save();
    const io = req.app.get('io');
    io.emit('newNotification', userNotification);

    const hotel = await Hotel.findById(req.body.hotelId).populate('hotelierId');
  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  const hotelierNotification = new HotelierNotification({
    hotelierId: hotel.hotelierId._id, 
    message: `You have a new booking for your hotel "${hotel.name}".`,
    createdAt: new Date(),
    isRead: false,
  });
  await hotelierNotification.save();
  }

  const createdBooking = await createBooking(bookingData);

  res.status(201).json(createdBooking);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { paymentId, bookingId, paymentStatus } = req.body;

  const userNotification = new Notification({
    userId: req.user._id,
    message: `Your booking has been confirmed via Razorpay payment.`,
    createdAt: new Date(),
    isRead: false,
  });
  await userNotification.save();

  const io = req.app.get('io');
  io.emit('newNotification', userNotification);

  const updatedBooking = await updateBookingStatusService(paymentId, bookingId, paymentStatus);
  if (!updatedBooking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const hotel = await Hotel.findById(updatedBooking.hotelId).populate('hotelierId');
  if (!hotel) {
    res.status(404).json({ message: 'Hotel not found' });
    return;
  }

  const hotelierNotification = new HotelierNotification({
    hotelierId: hotel.hotelierId._id,
    message: `You have a new booking for your hotel "${hotel.name}".`,
    createdAt: new Date(),
    isRead: false,
  });
  await hotelierNotification.save();

  io.emit('newNotification', hotelierNotification);

  res.status(200).json(updatedBooking);
});

const getBookingsByUserId = asyncHandler(async (req, res) => {
  const bookings = await getBookingsByUserIdService(req.user._id);
  if (bookings) {
    res.json(bookings);
  } else {
    res.status(404).json({ message: 'Bookings not found' });
  }
});

const getHotelierBookings = asyncHandler(async (req, res) => {
  const bookings = await getHotelierBookingsService(req.hotelier._id);
  if (bookings) {
    res.json(bookings);
  } else {
    res.status(404).json({ message: 'Bookings not found' });
  }
});
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await getAllBookingsService();
  if (bookings) {
    res.json(bookings);
  } else {
    res.status(404).json({ message: 'Bookings not found' });
  }
});
const checkRoomAvailability = asyncHandler(async (req, res) => {
  console.log("1");
  
  const { roomId, checkInDate, checkOutDate, roomCount,guestCount } = req.body;

  const availability = await checkAvailability(roomId, checkInDate, checkOutDate, roomCount,guestCount);

  res.json(availability);
});




export { saveBooking ,
  updateBookingStatus,
  getBookingsByUserId,
  getHotelierBookings,
  getAllBookings,
  checkRoomAvailability
};
