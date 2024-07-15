import Booking from '../models/bookingModel.js';

 const checkRoomAvailability = async (roomId, checkInDate, checkOutDate) => {
  const bookings = await Booking.find({
    roomId,
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate }
  });

  return bookings;
};

const saveNewBooking = async (bookingData) => {
  const booking = new Booking(bookingData);
  return await booking.save();
};

 const findBookingById = async (bookingId) => {
  return await Booking.findById(bookingId);
};

 const saveUpdatedBooking = async (booking) => {
  return await booking.save();
};
const findBookingsByUserId = async (userId) => {
  return await Booking.find({ userId })
    .populate('hotelId', 'name')
    .populate('roomId', 'type amenities description');
};
const findBookingsByHotelierId = async (hotelierId) => {
  return await Booking.find({ hotelierId })
    .populate('hotelId')
    .populate('roomId')
    .populate('userId');
};
const findAllBookings = async () => {
  return await Booking.find({})
    .populate('hotelId')
    .populate('roomId')
    .populate('userId')
    .populate('hotelierId');
};

export{
  checkRoomAvailability,
  saveNewBooking,
  findBookingById,
  saveUpdatedBooking,
  findBookingsByUserId,
  findBookingsByHotelierId,
  findAllBookings
}