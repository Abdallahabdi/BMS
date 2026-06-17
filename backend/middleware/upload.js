import multer from "multer";

// We use memory storage because we will upload to ImgBB from the controller
const storage = multer.memoryStorage();

export default multer({ storage });
