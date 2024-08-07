import expressAsyncHandler from 'express-async-handler';
import ChatRoom from '../models/chatRoomModel.js';
import Message from '../models/messageModel.js';
import Hotel from '../models/hotelModel.js';

const getChatRooms = expressAsyncHandler(async (req, res) => {
  const chatRooms = await ChatRoom.find({ userId: req.user._id }).populate('hotelId', 'name');

  const chatRoomsWithUnreadCount = await Promise.all(chatRooms.map(async (room) => {
    const unreadMessagesCount = await Message.countDocuments({
      chatRoomId: room._id,
      senderType: 'Hotel',
      read: false,
    });
    return {
      ...room.toObject(),
      unreadMessagesCount,
    };
  }));

  res.json(chatRoomsWithUnreadCount);
});

const createChatRoom = expressAsyncHandler(async (req, res) => {
  const { hotelId } = req.body;
  let chatRoom = await ChatRoom.findOne({ userId: req.user._id, hotelId });
  
  if (!chatRoom) {
    chatRoom = await ChatRoom.create({ userId: req.user._id, hotelId });
  }
  
  res.status(201).json(chatRoom);
});

const getMessages = expressAsyncHandler(async (req, res) => {
  const messages = await Message.find({ chatRoomId: req.params.chatRoomId }).sort('timestamp');
  res.json(messages);
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  const chatRoomId = req.params.chatRoomId;
  const { content, senderType } = req.body;
  const file = req.file;  


  const newMessageData = {
    chatRoomId,
    createdAt: Date.now(),
  };
  if (file) {
    newMessageData.fileUrl = `/MessageFiles/${file.filename}`; 
    newMessageData.fileName = file.originalname
  }
  if (content) {
    newMessageData.content = content; 
  }

  if (senderType === 'User') {
    newMessageData.sender = req.user._id;
    newMessageData.senderType = 'User';
  } else if (senderType === 'Hotel') {
    newMessageData.sender = req.hotel._id;
    newMessageData.senderType = 'Hotel';
  }

  const newMessage = await Message.create(newMessageData);
  await ChatRoom.findByIdAndUpdate(chatRoomId, { lastMessage: content, lastMessageTime: Date.now() });

  const io = req.app.get('io');
  io.to(chatRoomId).emit('message', newMessage);

  res.status(201).json(newMessage);
});

const getUnreadMessages = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({ userId: req.user._id });
    const chatRoomIds = chatRooms.map((room) => room._id);

    const unreadMessages = await Message.find({
      chatRoomId: { $in: chatRoomIds },
      senderType: 'Hotel',
      read: false,
    });

    res.json(unreadMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getHotelUnreadMessages = async (req, res) => {  
  try {
    const hotels = await Hotel.find({ hotelierId: req.hotelier._id });
    const hotelIds = hotels.map(hotel => hotel._id);

    const chatRooms = await ChatRoom.find({ hotelId: { $in: hotelIds } });
    const chatRoomIds = chatRooms.map(room => room._id);

    const unreadMessages = await Message.find({
      chatRoomId: { $in: chatRoomIds },
      senderType: 'User',
      read: false,
    });


    res.json(unreadMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const markMessagesAsRead = expressAsyncHandler(async (req, res) => {
  const { chatRoomId } = req.body;

  await Message.updateMany(
    { chatRoomId, senderType: { $ne: 'User' }, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({ message: 'Messages marked as read' });
});


const getHotelChatRooms = expressAsyncHandler(async (req, res) => {
  const chatRooms = await ChatRoom.find({ hotelId: req.params.hotelId }).populate('userId', 'name');

  const chatRoomsWithUnreadCount = await Promise.all(chatRooms.map(async (room) => {
    const unreadMessagesCount = await Message.countDocuments({
      chatRoomId: room._id,
      senderType: 'User',
      read: false,
    });
    return {
      ...room.toObject(),
      unreadMessagesCount,
    };
  }));

  res.json(chatRoomsWithUnreadCount);
});


const getHotelMessages = expressAsyncHandler(async (req, res) => {
  const messages = await Message.find({ chatRoomId: req.params.chatRoomId }).sort('timestamp');
  res.json(messages);
});

const sendHotelMessages = expressAsyncHandler(async (req, res) => {
  
  const chatRoomId = req.params.chatRoomId;
  
  const { content, senderType, hotelId } = req.body; 
    
  const file = req.file;

  const newMessageData = {
    chatRoomId,
    createdAt: Date.now(),
  };

  if (file) {
    newMessageData.fileUrl = `/MessageFiles/${file.filename}`;
    newMessageData.fileName = file.originalname

  }
  if (content) {
    newMessageData.content = content;
  }

  if (senderType === 'User') {
    newMessageData.sender = req.user._id;
    newMessageData.senderType = 'User';
  } else if (senderType === 'Hotel') {
    newMessageData.sender = hotelId; 
    newMessageData.senderType = 'Hotel';
  }

  const newMessage = await Message.create(newMessageData);
  await ChatRoom.findByIdAndUpdate(chatRoomId, { lastMessage: content, lastMessageTime: Date.now() });

  const io = req.app.get('io');
  io.to(chatRoomId).emit('message', newMessage);

  res.status(201).json(newMessage);
});
const markHotelMessagesAsRead = expressAsyncHandler(async (req, res) => {
  const { chatRoomId } = req.body;


  await Message.updateMany(
    { chatRoomId, senderType: { $ne: 'Hotel' }, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({ message: 'Messages marked as read'});
});


export { getChatRooms, createChatRoom, getMessages, sendMessage,getHotelMessages,sendHotelMessages,getHotelChatRooms,getUnreadMessages,markMessagesAsRead,
  markHotelMessagesAsRead,getHotelUnreadMessages
 };
