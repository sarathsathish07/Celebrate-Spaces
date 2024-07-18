import express from 'express'
const router= express.Router()
import { authAdmin, 
  logoutAdmin,
  updateUser,
  getAllUsers,
  getVerificationDetails,
  acceptVerification,
  rejectVerification,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel,
  getAdminStats } from '../controllers/adminController.js'
  import { getAllBookings } from '../controllers/bookingController.js'
import {protect} from '../middleware/adminAuthMiddleware.js'

  router.post('/auth',authAdmin)
  router.post('/logout',logoutAdmin)
  router.post('/get-user',protect,getAllUsers)
  router.put('/update-user',updateUser)
  router.get('/verification',getVerificationDetails)
  router.put('/verification/:hotelId/accept',acceptVerification)
  router.put('/verification/:adminId/reject', rejectVerification);
  router.patch('/block-user',blockUser)
  router.patch('/unblock-user',unblockUser)
  router.get('/get-hotels', protect, getAllHotels);
  router.patch('/list-hotel/:hotelId', protect, listHotel);
  router.patch('/unlist-hotel/:hotelId', protect, unlistHotel);
  router.get('/bookings', protect, getAllBookings);
  router.get('/stats',protect, getAdminStats);
  
  
  





export default router