import asyncHandler from 'express-async-handler';
import RoomService from '../services/roomService.js';

const addRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const hotelierId = req.hotelier._id;
  const { type, price, area, occupancy, noOfRooms, description, amenities } = req.body;

  if (!req.files) {
    res.status(400);
    throw new Error("No images uploaded");
  }

  const images = req.files.map((file) => file.path);

  const roomData = {
    type,
    price,
    area,
    occupancy,
    noOfRooms,
    description,
    amenities: amenities.split(",").map((amenity) => amenity.trim()),
    images,
  };

  const createdRoom = await RoomService.addRoomHandler(hotelId, hotelierId, roomData);
  res.status(201).json(createdRoom);
});

const getRoomById = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomService.getRoomByIdHandler(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export { addRoom,
  getRoomById
 };
