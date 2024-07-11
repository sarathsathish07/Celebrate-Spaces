import express from 'express';
import { authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyOtp ,
  resendOtp,
  getHotels,
  getHotelById,
} from '../controllers/userController.js';
import { saveBooking,updateBookingStatus,getBookingsByUserId } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { multerUploadUserProfile } from "../config/multerConfig.js";

const router = express.Router()


router.post('/',registerUser)
router.post('/auth',authUser)
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/logout',logoutUser)
router.route('/profile').get(protect,getUserProfile).put( multerUploadUserProfile.single('profileImage'),protect,updateUserProfile);
router.get('/hotels',getHotels )
router.get('/hotels/:id', getHotelById);
router.post('/booking',protect, saveBooking);
router.put('/booking/update-status',protect, updateBookingStatus);
router.get('/bookings/:userId', protect, getBookingsByUserId);

export default router
