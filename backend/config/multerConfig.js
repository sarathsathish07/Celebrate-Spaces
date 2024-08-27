import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

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
const messageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'MessageFiles');
    ensureDirectoryExists(uploadPath);
    console.log(`File will be uploaded to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false); 
  }
};

const fileFilterMessage = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" || 
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    file.mimetype === "application/vnd.ms-excel" || 
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
    file.mimetype === "text/plain" 
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, and certain document files are allowed!"), false);
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
export const multerUploadMessageFile = multer({
  storage: messageStorage,
  fileFilter: fileFilterMessage,
});