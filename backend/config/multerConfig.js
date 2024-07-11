import multer from "multer";
import path from "path";

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/public/UserProfileImages");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/public/CertificateUploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const hotelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/public/HotelImages"); 
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const roomStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/public/RoomImages"); 
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false); 
  }
};

export const multerUploadUserProfile = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
});

export const multerUploadCertificate = multer({
  storage: certificateStorage,
  fileFilter: fileFilter,
});

export const multerUploadHotelImages = multer({
  storage: hotelStorage,
  fileFilter: fileFilter,
});

export const multerUploadRoomImages = multer({
  storage: roomStorage,
  fileFilter: fileFilter,
});
