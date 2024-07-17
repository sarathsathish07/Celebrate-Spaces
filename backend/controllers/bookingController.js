import asyncHandler from 'express-async-handler';
import { checkAvailability,createBooking,updateBookingStatusService,getBookingsByUserIdService,getHotelierBookingsService,getAllBookingsService } from '../services/bookingService.js';
import Wallet from '../models/walletModel.js';

const saveBooking = asyncHandler(async (req, res) => {
  const bookingData = {
    userId: req.user._id,
    ...req.body,
    bookingDate: Date.now(),
    bookingStatus: req.body.paymentStatus === 'completed' ? 'confirmed' : 'pending',
  };

  if (req.body.paymentMethod === 'wallet') {
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
  }

  const createdBooking = await createBooking(bookingData);
  res.status(201).json(createdBooking);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId, paymentStatus } = req.body;
  const updatedBooking = await updateBookingStatusService(bookingId, paymentStatus);
  if (!updatedBooking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
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
  const { roomId, checkInDate, checkOutDate, roomCount } = req.body;

  const availability = await checkAvailability(roomId, checkInDate, checkOutDate, roomCount);

  res.json(availability);
});




export { saveBooking ,
  updateBookingStatus,
  getBookingsByUserId,
  getHotelierBookings,
  getAllBookings,
  checkRoomAvailability
};
