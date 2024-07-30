import expressAsyncHandler from 'express-async-handler';
import ChatRoom from '../models/chatRoomModel.js';
import Message from '../models/messageModel.js';

const getChatRooms = expressAsyncHandler(async (req, res) => {
  const chatRooms = await ChatRoom.find({ userId: req.user._id }).populate('hotelId', 'name');
  res.json(chatRooms);
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

  const newMessageData = {
    chatRoomId,
    content,
    createdAt: Date.now(),
  };

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


const getHotelChatRooms = expressAsyncHandler(async (req, res) => {
  const chatRooms = await ChatRoom.find({ hotelId: req.params.hotelId }).populate('userId', 'name');
  res.json(chatRooms);
});

const getHotelMessages = expressAsyncHandler(async (req, res) => {
  console.log(req.params.chatroomId);
  const messages = await Message.find({ chatRoomId: req.params.chatroomId }).populate('sender', 'name');
  res.json(messages);
});

const sendHotelMessages = expressAsyncHandler(async (req, res) => {
  const { content, senderType, hotelId } = req.body;
  const chatRoomId = req.params.chatroomId;

  const message = new Message({
    chatRoomId,
    sender: hotelId,
    senderType,
    content,
  });

  await message.save();

  const io = req.app.get('io');
  io.to(chatRoomId).emit('message', message);

  res.status(201).json(message);
});

export { getChatRooms, createChatRoom, getMessages, sendMessage,getHotelMessages,sendHotelMessages,getHotelChatRooms };
