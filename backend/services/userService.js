import crypto from 'crypto';
import nodemailer from 'nodemailer';
import * as userRepository from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken'

const generateToken = (res,userId)=>{
  const token = jwt.sign({userId}, process.env.JWT_SECRET,{
    expiresIn:"30d",
  })

  res.cookie('jwt', token, {
    httpOnly: true,  
    secure: process.env.NODE_ENV !== 'development',  
    sameSite: 'strict',  
    maxAge: 30 * 24 * 60 * 60 * 1000,  
  })
}

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

const authenticateUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);

  if (user && (await user.matchPassword(password))) {
    if (user.isBlocked) {
      throw new Error('User is blocked');
    }
    if (!user.otpVerified) {
      throw new Error('Please verify your OTP before logging in');
    }
    return user;
  } else {
    throw new Error('Invalid email or password');
  }
};

const registerNewUser = async (name, email, password) => {
  const userExists = await userRepository.findUserByEmail(email);

  if (userExists && !userExists.otpVerified) {
    await resendOtp(email);
    return { userExists, message: 'User already exists but is not verified. OTP has been resent.' };
  } else if (userExists) {
    throw new Error('User already exists and is verified.');
  } else {
    const otp = crypto.randomInt(100000, 999999);
    const user = await userRepository.createUser({
      name,
      email,
      password,
      otp,
      otpVerified: false,
    });

    await sendOtpEmail(user.email, otp);
    return { user, message: 'User registered successfully' };
  }
};
const verifyUserOtp = async (email, otp) => {
  const user = await userRepository.findUserByEmail(email);

  if (user && user.otp.toString() === otp.trim()) {
    user.otpVerified = true;
    await userRepository.saveUser(user);
    return { message: 'OTP verified successfully' };
  } else {
    throw new Error('Invalid OTP');
  }
};
const resendOtp = async (email) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const otp = crypto.randomInt(100000, 999999);
  user.otp = otp;
  await userRepository.saveUser(user);
  await sendOtpEmail(user.email, otp);
};

const logoutUser = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return { message: 'User logged out' };
};

const getUserProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImageName:user.profileImageName
  };
};



const updateUserProfile = async (userId, updateData,profileImage) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.name = updateData.name || user.name;
  user.email = updateData.email || user.email;
  if (updateData.password) {
    user.password = updateData.password;
  }
  if (profileImage) {
    user.profileImageName = profileImage.filename || user.profileImageName;
  }

  return await userRepository.saveUser(user);
};
const getSingleHotelById = async (id) => {
  const hotel = await userRepository.findHotelById(id);
  if (hotel) {
    const rooms = await userRepository.findRoomsByHotelId(id);
    return { ...hotel._doc, rooms };
  }
  return null;
};

export {
  authenticateUser,
  registerNewUser,
  verifyUserOtp,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  generateToken,
  resendOtp,
  getSingleHotelById
};
