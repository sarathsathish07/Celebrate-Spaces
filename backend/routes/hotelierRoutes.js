import express from 'express';
import { multerUploadCertificate } from "../config/multerConfig.js";
import { multerUploadUserProfile } from '../config/multerConfig.js';
import { authHotelier, registerHotelier, logoutHotelier, getHotelierProfile, updateHotelierProfile, verifyHotelierOtp,addHotel,getHotels,
  getHotelById,updateHotel
 } from '../controllers/hotelierController.js';
import { protect } from '../middleware/hotelierAuthMiddleware.js';
import { uploadVerificationDetails } from '../controllers/hotelierController.js';

const router = express.Router();

router.post('/', registerHotelier);
router.post('/auth', authHotelier);
router.post('/verify-otp', verifyHotelierOtp);
router.post('/logout', logoutHotelier);
router.route('/profile').get(protect, getHotelierProfile).put(multerUploadUserProfile.single('profileImageName'), protect, updateHotelierProfile);
router.post('/verification', multerUploadCertificate.single('certificates'),protect, uploadVerificationDetails);
router.post('/add-hotel',protect, addHotel);
router.get('/get-hotels',protect, getHotels);
router.get('/:id', protect, getHotelById);  // Route for getting a hotel by ID
router.put('/:id', protect, updateHotel);

export default router;
