import expressAsyncHandler from 'express-async-handler';
import * as adminService from '../services/adminService.js';
import { generateAdminToken } from '../services/adminService.js';

const authAdmin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await adminService.authenticateAdmin(email, password);
    generateAdminToken(res, admin._id);
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
    });
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});


const logoutAdmin = expressAsyncHandler(async (req, res) => {
  const message =  adminService.logoutAdmin(res);
  res.status(200).json(message);
});

const getAllUsers = expressAsyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers();
  res.status(200).json(users);
});

const updateUser = expressAsyncHandler(async (req, res) => {
  const { userId, name, email } = req.body;
  const updatedUser = await adminService.updateUser(userId, { name, email });
  res.status(200).json(updatedUser);
});


const getVerificationDetails = expressAsyncHandler(async (req, res) => {
  const hoteliers = await adminService.getVerificationDetails();
  res.status(200).json(hoteliers);
});

const acceptVerification = expressAsyncHandler(async (req, res) => {
  try {
    await adminService.acceptVerification(req.params.hotelierId);
    res.json({ message: 'Verification accepted' });
  } catch (error) {
    console.error('Error accepting verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const rejectVerification = expressAsyncHandler(async (req, res) => {
  try {
    await adminService.rejectVerification(req.params.hotelierId);
    res.json({ message: 'Verification rejected' });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const blockUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  const message = await adminService.blockUser(userId);
  res.status(200).json(message);
});

const unblockUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  const message = await adminService.unblockUser(userId);
  res.status(200).json(message);
});
const getAllHotels = expressAsyncHandler(async (req, res) => {
  const hotels = await adminService.getAllHotels();
  res.status(200).json(hotels);
});
const listHotel = expressAsyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const result = await adminService.listHotel(hotelId);
  res.status(200).json(result);
});

const unlistHotel = expressAsyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const result = await adminService.unlistHotel(hotelId);
  res.status(200).json(result);
});

export {
  authAdmin,
  logoutAdmin,
  getAllUsers,
  updateUser,
  getVerificationDetails,
  acceptVerification,
  rejectVerification,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel
};
