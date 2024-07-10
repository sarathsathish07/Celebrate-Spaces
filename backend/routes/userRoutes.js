import express from 'express';
import { authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyOtp ,
  resendOtp,
  getHotels
} from '../controllers/userController.js';
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

export default router
