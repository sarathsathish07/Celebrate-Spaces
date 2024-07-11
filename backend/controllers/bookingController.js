import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';

const saveBooking = asyncHandler(async (req, res) => {
  const {
    hotelId,
    roomId,
    checkInDate,
    checkOutDate,
    paymentMethod,
    paymentStatus,
    hotelierId,
    roomsBooked,
    totalAmount,
  } = req.body;

  const booking = new Booking({
    userId: req.user._id,
    hotelId,
    roomId,
    checkInDate,
    checkOutDate,
    paymentMethod,
    paymentStatus,
    bookingDate: Date.now(),
    bookingStatus: paymentStatus === 'completed' ? 'confirmed' : 'pending',
    hotelierId,
    roomsBooked,
    totalAmount,
  });

  const createdBooking = await booking.save();
  console.log(createdBooking);
  res.status(201).json(createdBooking);
});

const updateBookingStatus = async (req, res) => {
  console.log("1");
  try {
    const { bookingId, paymentStatus } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { saveBooking ,
  updateBookingStatus
};
