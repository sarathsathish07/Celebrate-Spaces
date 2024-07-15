import { checkRoomAvailability, saveNewBooking,findBookingById,saveUpdatedBooking,findBookingsByUserId,findBookingsByHotelierId,findAllBookings } from '../repositories/bookingRepository.js';

 const checkAvailability = async (roomId, checkInDate, checkOutDate, roomCount) => {
  const bookings = await checkRoomAvailability(roomId, new Date(checkInDate), new Date(checkOutDate));

  const totalBookedRooms = bookings.reduce((acc, booking) => acc + booking.roomsBooked, 0);

  return { isAvailable: totalBookedRooms + roomCount <= roomCount };
};

//  const bookRoom = async (bookingData) => {
//   const booking = await createBooking(bookingData);
//   return booking;
// };

const updateBookingStatusService = async (bookingId, paymentStatus) => {
  const booking = await findBookingById(bookingId);
  if (!booking) {
    return null;
  }
  booking.paymentStatus = paymentStatus;
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
