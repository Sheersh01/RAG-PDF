import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { extractPdfText } from "../services/pdfService.js";
import { processDocument } from "../rag/processDocument.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const text = await extractPdfText(req.file.path);

    console.log(text);

    const document = new Document({
      userId: req.user.id,
      type: "resume",
      fileName: req.file.filename,
      extractedText: text,
    });

    const chunks = await processDocument(text);

    await Promise.all(
      chunks.map((chunk) =>
        DocumentChunk.create({
          userId: req.user.id,
          documentId: document._id,
          content: chunk.content,
          embedding: chunk.embedding,
        }),
      ),
    );

    await document.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getResume = async (req, res) => {
  try {
    const document = await Document.findOne({
      userId: req.user.id,
      type: "resume",
    }).select("-extractedText");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload a resume.",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

