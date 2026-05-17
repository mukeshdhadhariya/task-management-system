import multer, { FileFilterCallback } from "multer";
import { ApiError } from "../utils/apierror";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return cb(new ApiError(400, "Only PDF files are allowed") as any);
  }

  cb(null, true);
};

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
  },
});

// Helper to create an array upload middleware for a field with a max count
export const uploadPdfArray = (fieldName: string, maxCount = 3) => uploadPdf.array(fieldName, maxCount);