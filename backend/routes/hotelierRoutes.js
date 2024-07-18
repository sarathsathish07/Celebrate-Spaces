import express from 'express';
import { multerUploadCertificate, multerUploadUserProfile, multerUploadHotelImages, multerUploadRoomImages } from "../config/multerConfig.js";
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
  uploadVerificationDetailsHandler,
  getHotelierStats
 } from '../controllers/hotelierController.js';
 import { addRoom,getRoomById,updateRoomHandler } from '../controllers/roomController.js';
 import { getHotelierBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/hotelierAuthMiddleware.js';


const router = express.Router();

router.post('/', registerHotelierHandler);
router.post('/auth', authHotelierHandler);
router.post('/verify-otp', verifyHotelierOtpHandler);
router.post('/resend-otp', resendHotelierOtpHandler);
router.post('/logout', logoutHotelierHandler);
router.route('/profile').get(protect, getHotelierProfileHandler).put( multerUploadUserProfile.single('profileImage'),protect, updateHotelierProfileHandler);
router.post('/upload-certificate/:hotelId', protect, multerUploadCertificate.single('certificate'), uploadVerificationDetailsHandler);
router.post(
  "/add-hotel",
  protect, multerUploadHotelImages.array("images", 5),
  addHotelHandler
);
router.get('/get-hotels',protect, getHotelsHandler);
router.get('/bookings',protect, getHotelierBookings);
router.get('/dashboard',protect,getHotelierStats),
router.get('/:id', protect, getHotelByIdHandler);
router.put('/:id', protect,multerUploadHotelImages.array("images", 5), updateHotelHandler);
router.post('/add-room/:hotelId', protect, multerUploadRoomImages.array("images", 5), addRoom);
router.put('/rooms/:roomId', protect, multerUploadRoomImages.array("images", 5), updateRoomHandler);
router.get('/rooms/:roomId',protect, getRoomById);


export default router;
