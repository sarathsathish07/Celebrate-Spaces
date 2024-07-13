import RoomRepository from '../repositories/roomRepository.js';
import path from 'path';

const addRoomHandler = async (hotelId, hotelierId, roomData) => {
  return await RoomRepository.createRoom(hotelId, hotelierId, roomData);
};
const getRoomByIdHandler = async (roomId) => {
  try {
    const room = await RoomRepository.getRoomById(roomId);
    return room;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getRoomsByHotelIdsService = async (hotelIds) => {
  try {
    return await RoomRepository.findRoomsByHotelIds(hotelIds);
  } catch (error) {
    throw new Error('Error fetching rooms');
  }
};
const updateRoomData = async (roomId, updateData, files) => {
  try {
    const room = await RoomRepository.getRoomById(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    room.type = updateData.type || room.type;
    room.price = updateData.price || room.price;
    room.area = updateData.area || room.area;
    room.occupancy = updateData.occupancy || room.occupancy;
    room.noOfRooms = updateData.noOfRooms || room.noOfRooms;
    room.description = updateData.description || room.description;
    room.amenities = updateData.amenities ? updateData.amenities.split(",").map(item => item.trim()) : room.amenities;

    if (files && files.length > 0) {
      const newImages = files.map(file => path.relative("backend/public", file.path).replace(/\\/g, "/"));
      room.images.push(...newImages);
    }

    if (updateData.removeImages && updateData.removeImages.length > 0) {
      room.images = room.images.filter(image => !updateData.removeImages.includes(image));
    }

    await room.save();
    return room;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default { getRoomByIdHandler,
  getRoomsByHotelIdsService,
  updateRoomData,
  addRoomHandler
 };
