import crypto from 'crypto';
import nodemailer from 'nodemailer';
import * as userRepository from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken'

const generateToken = (res,userId)=>{
  const token = jwt.sign({userId}, process.env.JWT_SECRET,{
    expiresIn:"30d",
  })
  console.log('GenerateToken123:', token);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Only true in production
    sameSite: 'None', // Adjust for production
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  
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
      if (new Date() > user.otpExpiry) {
        throw new Error('OTP has expired. Please request a new OTP.');
      }
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
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    const user = await userRepository.createUser({
      name,
      email,
      password,
      otp,
      otpExpires,
      otpVerified: false,
    });

    await sendOtpEmail(user.email, otp);
    return { user, message: 'User registered successfully' };
  }
};
const verifyUserOtp = async (email, otp) => {
  const user = await userRepository.findUserByEmail(email);

  if (user && user.otp.toString() === otp.trim()) {
    if (user.otpExpires && user.otpExpires < Date.now()) {
      throw new Error('OTP has expired');
    }
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
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
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



const updateUserProfileService = async (userId, updateData, profileImage) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (updateData.currentPassword) {
    const isMatch = await user.matchPassword(updateData.currentPassword);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }
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

const sendEmail = async ({ to, subject, text }) => {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sarathsathish77@gmail.com', 
      pass: 'pehs ltsj iktw pqtp', 
    },
  });

  let mailOptions = {
    from: 'sarathsathish77@gmail.com', 
    to: to, 
    subject: subject, 
    text: text,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmailService = async (email, req) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpire = Date.now() + 30 * 60 * 1000; 

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = resetTokenExpire;
  await userRepository.saveUser(user);

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const message = `
    You requested a password reset. Please make a PUT request to:
    ${resetUrl}
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    return { message: 'Email sent' };
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await userRepository.saveUser(user);
    throw new Error('Email could not be sent');
  }
};
const resetPasswordService = async (resetToken, password) => {
  const user = await userRepository.findUserByResetToken(resetToken);

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  user.password = password; 
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await userRepository.saveUser(user);

  return { message: 'Password reset successfully' };
};

export {
  authenticateUser,
  registerNewUser,
  verifyUserOtp,
  logoutUser,
  getUserProfile,
  updateUserProfileService,
  generateToken,
  resendOtp,
  getSingleHotelById,
  sendPasswordResetEmailService,
  resetPasswordService
};
