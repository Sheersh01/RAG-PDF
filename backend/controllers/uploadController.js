import Document from "../models/Document.js";
import { extractTextFromPdf } from "../services/pdfService.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    const extractedText = await extractTextFromPdf(req.file.buffer || req.file.path);
    const uploadType = req.path.replace("/", "") || "document";

    const document = await Document.create({
      userId: req.user.userId,
      type: uploadType,
      fileName: req.file.filename || req.file.originalname,
      extractedText,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded and text extracted successfully",
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename || req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path || "in-memory",
      },
      document: {
        id: document._id,
        type: document.type,
        fileName: document.fileName,
      },
      extractedText,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
