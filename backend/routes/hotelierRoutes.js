import express from 'express';
import { multerUploadCertificate,multerUploadUserProfile } from "../config/multerConfig.js";
import { authHotelierHandler, 
  registerHotelierHandler, 
  logoutHotelierHandler, 
  getHotelierProfileHandler, 
  updateHotelierProfileHandler, 
  verifyHotelierOtpHandler,
  addHotelHandler,
  getHotelsHandler,
  getHotelByIdHandler,
  updateHotelHandler,
  resendHotelierOtpHandler,
  uploadVerificationDetailsHandler
 } from '../controllers/hotelierController.js';
import { protect } from '../middleware/hotelierAuthMiddleware.js';


const router = express.Router();

router.post('/', registerHotelierHandler);
router.post('/auth', authHotelierHandler);
router.post('/verify-otp', verifyHotelierOtpHandler);
router.post('/resend-otp', resendHotelierOtpHandler);
router.post('/logout', logoutHotelierHandler);
router.route('/profile').get(protect, getHotelierProfileHandler).put( multerUploadUserProfile.single('profileImage'),protect, updateHotelierProfileHandler);
router.post('/verification', protect, multerUploadCertificate.single('certificate'), uploadVerificationDetailsHandler);
router.post('/add-hotel',protect, addHotelHandler);
router.get('/get-hotels',protect, getHotelsHandler);
router.get('/:id', protect, getHotelByIdHandler);
router.put('/:id', protect, updateHotelHandler);

export default router;
