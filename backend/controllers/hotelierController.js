import expressAsyncHandler from "express-async-handler";
import {
  authHotelier,
  registerHotelier,
  verifyHotelierOtp,
  logoutHotelier,
  getHotelierProfile,
  updateHotelierProfile,
  uploadCertificates,
  addHotel,
  getHotels,
  getHotelById,
  updateHotelData,
  resendOtp
} from '../services/hotelService.js';
import generateHotelierToken from "../utils/generateHotelierToken.js";

const authHotelierHandler = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authHotelier(email, password);
    generateHotelierToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

const registerHotelierHandler = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, userExists, message } = await registerHotelier(name, email, password);
    if (userExists) {
      res.status(200).json({
        message,
        otpSent: true,
      });
    } else {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        otpSent: true,
        message,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const verifyHotelierOtpHandler = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const message = await verifyHotelierOtp(email, otp);
    res.status(200).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const resendHotelierOtpHandler = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await resendOtp(email);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const logoutHotelierHandler = expressAsyncHandler(async (req, res) => {
  const response = await logoutHotelier(res);
  res.status(200).json(response);
});

const getHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  const user = await getHotelierProfile(req.hotelier._id);
  res.status(200).json(user);
});

const updateHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  try {
    const updatedHotelier = await updateHotelierProfile(
      req.hotelier._id,
      req.body,
      req.file
    );
    res.status(200).json({
      _id: updatedHotelier._id,
      name: updatedHotelier.name,
      email: updatedHotelier.email,
      profileImageName: updatedHotelier.profileImageName
    });
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

const uploadVerificationDetailsHandler = expressAsyncHandler(async (req, res) => {
  const { hotelierId } = req.body;
  const certificatePath = req.file.path;

  try {
    await uploadCertificates(hotelierId, certificatePath);
    res.status(200).json({ message: 'Verification details submitted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

const addHotelHandler = expressAsyncHandler(async (req, res) => {
  const { name, city, address, images, description, amenities } = req.body;
  const response = await addHotel(req.hotelier._id, { name, city, address, images, description, amenities });
  res.status(response.status).json(response.data);
});

const getHotelsHandler = expressAsyncHandler(async (req, res) => {
  const response = await getHotels(req.hotelier._id);
  res.status(response.status).json(response.data);
});

const getHotelByIdHandler = expressAsyncHandler(async (req, res) => {
  const response = await getHotelById(req.params.id);
  res.status(response.status).json(response.data);
});

const updateHotelHandler = expressAsyncHandler(async (req, res) => {
  const response = await updateHotelData(req.params.id, req.body);
  res.status(response.status).json(response.data);
});

export {
  authHotelierHandler,
  registerHotelierHandler,
  verifyHotelierOtpHandler,
  logoutHotelierHandler,
  getHotelierProfileHandler,
  updateHotelierProfileHandler,
  uploadVerificationDetailsHandler,
  addHotelHandler,
  getHotelsHandler,
  getHotelByIdHandler,
  updateHotelHandler,
  resendHotelierOtpHandler
};
