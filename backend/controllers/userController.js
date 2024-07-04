import expressAsyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import Hotel from "../models/hotelModel.js";
import generateToken from "../utils/generateToken.js"
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isBlocked) {
      res.status(403);
      throw new Error('User is blocked');
    }
    if (!user.otpVerified) {
      res.status(401);
      throw new Error('Please verify your OTP before logging in');
    }
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});
const sendOtpEmail = async (email, otp) => {
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

const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = crypto.randomInt(100000, 999999);

  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpVerified: false,
  });

  if (user) {
    await sendOtpEmail(user.email, otp);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      otpSent: true,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const verifyOtp = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp.toString() === otp.trim()) {
    user.otpVerified = true;
    await user.save();
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400);
    throw new Error('Invalid OTP');
  }
});


const logoutUser = expressAsyncHandler(async (req,res)=>{
  res.cookie('jwt','',{
    httpOnly:true,
    expires: new Date(0)
  })
  res.status(200).json({message:"User logged out"})
})
const getUserProfile = expressAsyncHandler(async (req,res)=>{
  const user = {
    _id:req.user._id,
    name:req.user.name,
    email:req.user.email
  }
  res.status(200).json(user)
})
const updateUserProfile = expressAsyncHandler(async (req,res)=>{
  const user = await User.findById(req.user._id)
  if(user){
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if(req.body.password){
      user.password = req.body.password
    }
    if(req.file){
      user.profileImageName = req.file.filename || user.profileImageName;
  }

    const updatedUser = await user.save()
    res.status(200).json({
      _id:updatedUser._id,
      name:updatedUser.name,
      email:updatedUser.email,
      profileImageName:updatedUser.profileImageName
    })
  }else{
    res.status(404)
    throw new Error('User not found')
  }
})
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      {
        $lookup: {
          from: 'hoteliers',
          localField: 'hotelierId',
          foreignField: '_id',
          as: 'hotelier',
        },
      },
      {
        $unwind: '$hotelier',
      },
      {
        $match: {
          'hotelier.verificationStatus': 'accepted',
          isListed: true,
        },
      },
      {
        $project: {
          name: 1,
          city: 1,
          address: 1,
          images: 1,
          description: 1,
          amenities: 1,
          isListed: 1,
          hotelierId: 1,
        },
      },
    ]);

    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyOtp,
  getHotels
}