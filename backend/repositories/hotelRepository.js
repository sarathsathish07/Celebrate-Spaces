import Hotel from '../models/hotelModel.js';
import Hotelier from "../models/hotelierModel.js";

const getAcceptedHotels = async () => {
  return await Hotel.aggregate([
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
};

const findHotelierByEmail = async (email) => {
  return await Hotelier.findOne({ email });
};

const createHotelier = async (hotelierData) => {
  return await Hotelier.create(hotelierData);
};

// const updateHotelier = async (hotelierId, updateData, file) => {
//   const hotelier = await Hotelier.findById(hotelierId);
//   if (hotelier) {
//     hotelier.name = updateData.name || hotelier.name;
//     hotelier.email = updateData.email || hotelier.email;
//     if (updateData.password) {
//       hotelier.password = updateData.password;
//     }
//     if (file) {
//       hotelier.profileImageName = file.filename || hotelier.profileImageName;
//     }
//     return await hotelier.save();
//   }
//   return null;
// };

// const uploadVerificationDetails = async (hotelierId, certificatePath) => {
//   const hotelier = await Hotelier.findById(hotelierId);
//   if (hotelier) {
//     hotelier.certificates = certificatePath;
//     hotelier.verificationStatus = 'pending';
//     return await hotelier.save();
//   }
//   return null;
// };

const createHotel = async (hotelierId, hotelData) => {
  const hotel = new Hotel({ ...hotelData, hotelierId });
  return await hotel.save();
};

const findHotelsByHotelierId = async (hotelierId) => {
  return await Hotel.find({ hotelierId });
};

const findHotelById = async (hotelId) => {
  return await Hotel.findById(hotelId);
};

const findHotelierById = async (id) => {
  return await Hotelier.findById(id);
};  

const saveHotelier = async (user) => {
  return await user.save();
};
export {
  getAcceptedHotels,
  findHotelierByEmail,
  createHotelier,
  createHotel,
  findHotelsByHotelierId,
  findHotelById,
  findHotelierById,
  saveHotelier
};
