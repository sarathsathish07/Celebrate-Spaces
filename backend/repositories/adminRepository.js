import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Hotelier from '../models/hotelierModel.js';
import Hotel from '../models/hotelModel.js';

const credentials = {
  email: 'admin@gmail.com',
  password: '12345',
  _id: '61024896',
};

const findAdminByEmailAndPassword = asyncHandler(async (email, password) => {
  if (email === credentials.email && password === credentials.password) {
    return credentials;
  } else {
    throw new Error('Invalid Credentials');
  }
});

const getAllUsers = asyncHandler(async () => {
  return await User.find({}, { name: 1, email: 1, profileImageName: 1, isBlocked: 1 });
});

const updateUser = asyncHandler(async (userId, userData) => {
  const user = await User.findById(userId);
  if (user) {
    user.name = userData.name || user.name;
    user.email = userData.email || user.email;
    user.isBlocked = userData.isBlocked !== undefined ? userData.isBlocked : user.isBlocked;
    return await user.save();
  } else {
    throw new Error('User not found');
  }
});


const deleteUserById = asyncHandler(async (userId) => {
  return await User.findByIdAndDelete(userId);
});

const createUser = asyncHandler(async (name, email, password) => {
  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new Error('User already exists');
  } else {
    const user = await User.create({
      name,
      email,
      password,
    });
    return user;
  }
});

const getPendingHotelierVerifications = asyncHandler(async () => {
  return await Hotelier.find({ verificationStatus: 'pending' }).select('-password');
});

// const acceptVerification = asyncHandler(async (hotelierId) => {
//   const hotelier = await Hotelier.findById(hotelierId);
//   if (!hotelier) {
//     throw new Error('Hotelier not found');
//   }
//   hotelier.verificationStatus = 'accepted';
//   await hotelier.save();
//   return hotelier;
// });

// const rejectVerification = asyncHandler(async (hotelierId) => {
//   const hotelier = await Hotelier.findById(hotelierId);
//   if (!hotelier) {
//     throw new Error('Hotelier not found');
//   }
//   hotelier.verificationStatus = 'rejected';
//   await hotelier.save();
//   return hotelier;
// });
const getAllHotels = asyncHandler(async () => {
  return await Hotel.find({});
});
const listHotel = asyncHandler(async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (hotel) {
    hotel.isListed = true;
    await hotel.save();
    return { message: 'Hotel listed successfully' };
  } else {
    throw new Error('Hotel not found');
  }
});

const unlistHotel = asyncHandler(async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (hotel) {
    hotel.isListed = false;
    await hotel.save();
    return { message: 'Hotel unlisted successfully' };
  } else {
    throw new Error('Hotel not found');
  }
});
const findHotelierById = async (id) => {
  return await Hotelier.findById(id);
};

const saveHotelier = async (hotelier) => {
  return await hotelier.save();
};

export {
  findAdminByEmailAndPassword,
  getAllUsers,
  updateUser,
  deleteUserById,
  createUser,
  getPendingHotelierVerifications,
  getAllHotels,
  listHotel,
  unlistHotel,
  findHotelierById,
  saveHotelier,
};
