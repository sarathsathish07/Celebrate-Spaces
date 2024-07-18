import {  saveNewBooking,findBookingById,saveUpdatedBooking,findBookingsByUserId,findBookingsByHotelierId,findAllBookings } from '../repositories/bookingRepository.js';
import Room from '../models/roomModel.js';
import Booking from '../models/bookingModel.js';

const checkAvailability = async (roomId, checkInDate, checkOutDate, roomCount) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const bookings = await Booking.find({
    roomId,
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  });

  const totalBookedRooms = bookings.reduce((acc, booking) => acc + booking.roomsBooked, 0);

  const isAvailable = totalBookedRooms + roomCount <= room.noOfRooms;

  return { isAvailable };
};

const updateBookingStatusService = async (bookingId, paymentStatus) => {
  const booking = await findBookingById(bookingId);
  if (!booking) {
    return null;
  }
  booking.paymentStatus = paymentStatus;
  booking.bookingStatus='confirmed'
  return await saveUpdatedBooking(booking);
};

const createBooking = async (bookingData) => {
  return await saveNewBooking(bookingData);
};
const getBookingsByUserIdService = async (userId) => {
  const bookings = await findBookingsByUserId(userId);
  return bookings;
};
const getHotelierBookingsService = async (hotelierId) => {
  const bookings = await findBookingsByHotelierId(hotelierId);
  return bookings;
};
const getAllBookingsService = async () => {
  const bookings = await findAllBookings();
  return bookings;
};

export{
  checkAvailability,
  createBooking,
  updateBookingStatusService,
  getBookingsByUserIdService,
  getHotelierBookingsService,
  getAllBookingsService
}
