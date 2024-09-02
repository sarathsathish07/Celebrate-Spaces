import {
  saveNewBooking,
  findBookingById,
  saveUpdatedBooking,
  findBookingsByUserId,
  findBookingsByHotelierId,
  findAllBookings,
} from "../repositories/bookingRepository.js";
import Room from "../models/roomModel.js";
import Booking from "../models/bookingModel.js";

const checkAvailability = async (roomId, checkInDate, checkOutDate, roomCount, guestCount) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const roomsRequired = Math.ceil(guestCount / room.occupancy);
  console.log("rr",roomsRequired);
  

  if (roomsRequired > roomCount) {
    return { isAvailable: false, message: `You need at least ${roomsRequired} rooms for ${guestCount} guests.` };
  }

  const bookings = await Booking.find({
    roomId,
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  });

  const totalBookedRooms = bookings.reduce(
    (acc, booking) => acc + booking.roomsBooked,
    0
  );

  const isAvailable = totalBookedRooms + roomsRequired <= room.noOfRooms;

  if (!isAvailable) {
    return { isAvailable: false, message: "Not enough rooms available for the selected dates." };
  }

  return { isAvailable: true, message: "Rooms are available." };
};


const updateBookingStatusService = async (
  paymentId,
  bookingId,
  paymentStatus
) => {
  const booking = await findBookingById(bookingId);
  if (!booking) {
    return null;
  }
  booking.paymentId = paymentId;
  booking.paymentStatus = paymentStatus;
  booking.bookingStatus = "confirmed";
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

export {
  checkAvailability,
  createBooking,
  updateBookingStatusService,
  getBookingsByUserIdService,
  getHotelierBookingsService,
  getAllBookingsService,
};
