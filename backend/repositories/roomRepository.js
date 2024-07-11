import Room from '../models/roomModel.js';

const createRoom = async (hotelId, hotelierId, roomData) => {
  const room = new Room({
    ...roomData,
    hotelId,
    hotelierId,
  });

  return await room.save();
};
const getRoomById = async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    return room;
  } catch (error) {
    throw new Error('Error fetching room details');
  }
};

export default { createRoom ,
  getRoomById
};
