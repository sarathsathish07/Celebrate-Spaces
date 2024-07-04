import asyncHandler from "express-async-handler";
import generateAdminToken from "../utils/generateAdminToken.js";
import User from "../models/userModel.js";
import Hotelier from "../models/hotelierModel.js";
import Hotel from "../models/hotelModel.js";
import nodemailer from 'nodemailer';

const credentials = {
  email: "admin@gmail.com",
  password: "12345",
  _id: "61024896"
};

const authAdmin = asyncHandler(async (req, res) => {
  
  if ( req.body.email == credentials.email &&
    req.body.password == credentials.password) {
      console.log("token creation");
      const adminToken=generateAdminToken(res, credentials._id);
      res.status(201).json({
        _id: credentials._id,
        email: credentials.email,
      });
    }
   else {
    
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});


const logoutAdmin = asyncHandler(async (req, res) => {
  console.log("444");
  res.cookie("jwtAdmin", "", {
    httpOnly: true,
    expires: new Date(),
  });
  res.status(200).json({ message: "Admin logged out" });
});


const getAllUser = asyncHandler(async (req, res) => {
  const userData = await User.find({}, { name: 1, email: 1 ,profileImageName:1,isBlocked:1});
  if (userData) {
    res.status(200).json(userData);
  } else {
    res.status(400);
    throw new Error("Error in fetching data");
  }
});


const updateUserData = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    const updateUser = await user.save();

    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
    });
  } else {
    res.status(400);
    throw new Error("user not found");
  }
});


const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const deleted = await User.findByIdAndDelete(userId);

  if (deleted) {
    res
      .status(200)
      .json({ success: true, message: "User Deleted Succesfully" });
  } else {
    res.status(404).json({ success: false, message: "USER delete Failed" });
  }
});


const addNewUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);

    throw new Error("User alredy exists");
  } else {
    const user = await User.create({
      name,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  }
});
const getVerificationDetails = async (req, res) => {
  try {
    const hoteliers = await Hotelier.find({ verificationStatus: 'pending' }).select('-password');
    res.json(hoteliers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'sarathsathish77@gmail.com',
    pass: 'pehs ltsj iktw pqtp',
  },
});


const acceptVerification = async (req, res) => {
  try {
    const hotelier = await Hotelier.findById(req.params.hotelierId);
    if (!hotelier) {
      return res.status(404).json({ message: 'Hotelier not found' });
    }
    
    hotelier.verificationStatus = 'accepted';
    await hotelier.save();
    
    await sendVerificationEmail(hotelier.email, 'Verification Accepted', 'Your verification request has been accepted.');

    res.json({ message: 'Verification accepted' });
  } catch (error) {
    console.error('Error accepting verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const rejectVerification = async (req, res) => {
  try {
    const hotelier = await Hotelier.findById(req.params.hotelierId);
    if (!hotelier) {
      return res.status(404).json({ message: 'Hotelier not found' });
    }
    
    hotelier.verificationStatus = 'rejected';
    await hotelier.save();
    
    await sendVerificationEmail(hotelier.email, 'Verification Rejected', 'Your verification request has been rejected.');

    res.json({ message: 'Verification rejected' });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const sendVerificationEmail = async (recipient, subject, message) => {
  try {
    await transporter.sendMail({
      from: 'sarathsathish77@gmail.com',
      to: recipient,
      subject: subject,
      text: message,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; 
  }
};

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  const user = await User.findById(userId);
  console.log(user);

  if (user) {
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: 'User blocked successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (user) {
    user.isBlocked = false;
    await user.save();
    res.status(200).json({ message: 'User unblocked successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
const getAllHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({});
  res.json(hotels);
});
const listHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);

  if (hotel) {
    hotel.isListed = true;
    await hotel.save();
    res.json({ message: 'Hotel listed successfully' });
  } else {
    res.status(404).json({ message: 'Hotel not found' });
  }
});
const unlistHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);

  if (hotel) {
    hotel.isListed = false;
    await hotel.save();
    res.json({ message: 'Hotel unlisted successfully' });
  } else {
    res.status(404).json({ message: 'Hotel not found' });
  }
});


export { authAdmin,
   logoutAdmin,
    addNewUser,
    deleteUser,
    updateUserData,
    getAllUser,
    getVerificationDetails,
    acceptVerification,
    rejectVerification,
    blockUser,
    unblockUser,
    getAllHotels,
    listHotel,
    unlistHotel
   };