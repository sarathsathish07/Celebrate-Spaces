import RoomRepository from '../repositories/roomRepository.js';

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

export default { getRoomByIdHandler,
  getRoomsByHotelIdsService
 };
