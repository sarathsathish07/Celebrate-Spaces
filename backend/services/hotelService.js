import {
  getAcceptedHotels,
  findHotelierByEmail,
  createHotelier,
  findHotelierById,
  saveHotelier,
  createHotel,
  findHotelsByHotelierId,
  findHotelById,
} from '../repositories/hotelRepository.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const fetchAcceptedHotels = async () => {
  return await getAcceptedHotels();
};


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

const authHotelier = async (email, password, res) => {
  const hotelier = await findHotelierByEmail(email);

  if (hotelier && (await hotelier.matchPassword(password))) {
    if (!hotelier.otpVerified) {
      throw new Error('Please verify your OTP before logging in');
    }
    return hotelier
  } else {
    throw new Error('Invalid email or password');
  }
};

const registerHotelier = async (name, email, password) => {
  const userExists = await findHotelierByEmail(email);

  if (userExists && !userExists.otpVerified) {
    await resendOtp(email);
    return { userExists, message: 'User already exists but is not verified. OTP has been resent.' };
  } else if (userExists) {
    throw new Error('User already exists and is verified.');
  } else {
    const otp = crypto.randomInt(100000, 999999);
    const user = await createHotelier({
      name,
      email,
      password,
      otp,
      otpVerified: false,
    });

    await sendHotelierOtpEmail(user.email, otp);
    return { user, message: 'User registered successfully' };
  }
};

const verifyHotelierOtp = async (email, otp) => {
  const hotelier = await findHotelierByEmail(email);

  if (hotelier && hotelier.otp.toString() === otp.trim()) {
    hotelier.otpVerified = true;
    await saveHotelier(hotelier);
    return { message: 'OTP verified successfully' };
  } else {
    throw new Error('Invalid OTP');
  }
};

const resendOtp = async (email) => {
  const hotelier = await findHotelierByEmail(email);

  if (!hotelier) {
    throw new Error('Hotelier not found');
  }

  const otp = crypto.randomInt(100000, 999999);
  hotelier.otp = otp;
  await saveHotelier(hotelier);
  await sendHotelierOtpEmail(hotelier.email, otp);
};

const logoutHotelier = async (res) => {
  res.cookie('jwtHotelier', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return { message: 'Hotelier logged out' };
};

const getHotelierProfile = async (userId) => {
  const user = await findHotelierById(userId);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImageName:user.profileImageName,
    verificationStatus:user.verificationStatus
  };
};

const updateHotelierProfile = async (hotelierId, updateData,profileImage) => {
  const hotelier = await findHotelierById(hotelierId);
  if (!hotelier) {
    throw new Error('Hotelier not found');
  }

  hotelier.name = updateData.name || hotelier.name;
  hotelier.email = updateData.email || hotelier.email;
  if (updateData.password) {
    hotelier.password = updateData.password;
  }
  if (profileImage) {
    hotelier.profileImageName = profileImage.filename || hotelier.profileImageName;
  }

  return await saveHotelier(hotelier);
};

const uploadCertificates = async (hotelierId, certificatePath) => {
  const hotelier = await findHotelierById(hotelierId);
  if (!hotelier) {
    throw new Error('Hotelier not found');
  }

  hotelier.certificates = certificatePath.replace('backend/public/', '');
  hotelier.verificationStatus="pending"
  return await saveHotelier(hotelier);
};

const addHotel = async (hotelierId, hotelData) => {
  const createdHotel = await createHotel(hotelierId, hotelData);
  return { status: 201, data: createdHotel };
};

const getHotels = async (hotelierId) => {
  const hotels = await findHotelsByHotelierId(hotelierId);
  return { status: 200, data: hotels };
};

const getHotelById = async (hotelId) => {
  const hotel = await findHotelById(hotelId);
  if (hotel) {
    return { status: 200, data: hotel };
  } else {
    return { status: 404, data: { message: 'Hotel not found' } };
  }
};

const updateHotelData = async (hotelId, updateData) => {
  const hotel = await findHotelById(hotelId);
  if (hotel) {
    hotel.name = updateData.name || hotel.name;
    hotel.city = updateData.city || hotel.city;
    hotel.address = updateData.address || hotel.address;
    hotel.description = updateData.description || hotel.description;
    hotel.amenities = updateData.amenities ? updateData.amenities.split(',').map(item => item.trim()) : hotel.amenities;

    // Handle image addition
    if (updateData.images && updateData.images.length > 0) {
      const uniqueImages = updateData.images.filter(newImage => !hotel.images.includes(newImage));
      hotel.images.push(...uniqueImages);
    }

    // Handle image removal
    if (updateData.removeImages && updateData.removeImages.length > 0) {
      hotel.images = hotel.images.filter(image => !updateData.removeImages.includes(image));
    }

    const updatedHotel = await hotel.save();
    return { status: 200, data: updatedHotel };
  } else {
    return { status: 404, data: { message: 'Hotel not found' } };
  }
};


export {
  fetchAcceptedHotels,
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
};
