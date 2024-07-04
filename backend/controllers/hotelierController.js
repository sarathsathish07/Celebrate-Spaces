import expressAsyncHandler from "express-async-handler";
import Hotelier from "../models/hotelierModel.js";
import Hotel from '../models/hotelModel.js'
import generateHotelierToken from "../utils/generateHotelierToken.js";
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const authHotelier = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const hotelier = await Hotelier.findOne({ email });

  if (hotelier && (await hotelier.matchPassword(password))) {
    if (!hotelier.otpVerified) {
      res.status(401);
      throw new Error('Please verify your OTP before logging in');
    }
    generateHotelierToken(res, hotelier._id);
    res.status(201).json({
      _id: hotelier._id,
      name: hotelier.name,
      email: hotelier.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const sendHotelierOtpEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sarathsathish77@gmail.com',
      pass: 'pehs ltsj iktw pqtp',
    },
  });

  let mailOptions = {
    from: 'sarathsathish77@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

const registerHotelier = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const hotelierExists = await Hotelier.findOne({ email });

  if (hotelierExists) {
    res.status(400);
    throw new Error('Hotelier already exists');
  }

  const otp = crypto.randomInt(100000, 999999);

  const hotelier = await Hotelier.create({
    name,
    email,
    password,
    otp,
    otpVerified: false,
  });

  if (hotelier) {
    await sendHotelierOtpEmail(hotelier.email, otp);
    res.status(201).json({
      _id: hotelier._id,
      name: hotelier.name,
      email: hotelier.email,
      otpSent: true,
    });
  } else {
    res.status(400);
    throw new Error('Invalid hotelier data');
  }
});

const verifyHotelierOtp = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const hotelier = await Hotelier.findOne({ email });

  if (hotelier && hotelier.otp.toString() === otp.trim()) {
    hotelier.otpVerified = true;
    await hotelier.save();
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400);
    throw new Error('Invalid OTP');
  }
});

const logoutHotelier = expressAsyncHandler(async (req, res) => {
  res.cookie('jwtHotelier', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: "Hotelier logged out" });
});

const getHotelierProfile = expressAsyncHandler(async (req, res) => {
  const hotelier = {
    _id: req.hotelier._id,
    name: req.hotelier.name,
    email: req.hotelier.email
  };
  res.status(200).json(hotelier);
});

const updateHotelierProfile = expressAsyncHandler(async (req, res) => {
  const hotelier = await Hotelier.findById(req.hotelier._id);
  if (hotelier) {
    hotelier.name = req.body.name || hotelier.name;
    hotelier.email = req.body.email || hotelier.email;
    if (req.body.password) {
      hotelier.password = req.body.password;
    }
    if (req.file) {
      hotelier.profileImageName = req.file.filename || hotelier.profileImageName;
    }
    const updatedHotelier = await hotelier.save();
    res.status(200).json({
      _id: updatedHotelier._id,
      name: updatedHotelier.name,
      email: updatedHotelier.email,
      profileImageName: updatedHotelier.profileImageName
    });
  } else {
    res.status(404);
    throw new Error('Hotelier not found');
  }
});
const uploadVerificationDetails = expressAsyncHandler(async (req, res) => {
  try {
    const certificatePath = req.file.filename;

    const hotelier = await Hotelier.findById(req.hotelier._id);

    if (!hotelier) {
      res.status(404);
      throw new Error('Hotelier not found');
    }

    hotelier.certificates = certificatePath;
    hotelier.verificationStatus = 'pending';

    await hotelier.save();

    res.status(200).json({ message: 'Verification details submitted successfully' });
  } catch (error) {
    console.error('Error in uploadVerificationDetails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const addHotel = expressAsyncHandler(async (req, res) => {
  const { name, city, address, images, description, amenities } = req.body;
  const hotelierId = req.hotelier._id;
  const hotel = new Hotel({ name, city, address, images, description, amenities, hotelierId });

  const createdHotel = await hotel.save();
  res.status(201).json(createdHotel);
});

const getHotels = expressAsyncHandler(async (req, res) => {
  const hotelierId = req.hotelier._id; 
  const hotels = await Hotel.find({ hotelierId });

  res.json(hotels);
});
const getHotelById = expressAsyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (hotel) {
    res.json(hotel);
  } else {
    res.status(404);
    throw new Error('Hotel not found');
  }
});

const updateHotel = expressAsyncHandler(async (req, res) => {
  const { name, city, address, description, amenities, images } = req.body;
  const hotelId = req.params.id;
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  // Update text fields
  hotel.name = name || hotel.name;
  hotel.city = city || hotel.city;
  hotel.address = address || hotel.address;
  hotel.description = description || hotel.description;
  hotel.amenities = amenities ? amenities.split(',').map(item => item.trim()) : hotel.amenities;

  // Handle image uploads
  if (images && images.length > 0) {
    // Filter out existing images to avoid duplication
    const uniqueImages = images.filter(newImage => !hotel.images.includes(newImage));

    // Append new images to existing array
    hotel.images.push(...uniqueImages);
  }

  const updatedHotel = await hotel.save();
  res.json(updatedHotel);
});






export {
  authHotelier,
  registerHotelier,
  logoutHotelier,
  getHotelierProfile,
  updateHotelierProfile,
  verifyHotelierOtp,
  uploadVerificationDetails,
  addHotel,
  getHotels,
  getHotelById,
  updateHotel
};
