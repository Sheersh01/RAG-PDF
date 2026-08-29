import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { extractPdfText } from "../services/pdfService.js";
import { processJdDocument } from "../rag/processJdDocument.js";

const purgeExistingJds = async (userId) => {
  const existingJds = await Document.find({ userId, type: "jd" });
  if (existingJds.length === 0) return;

  const docIds = existingJds.map((doc) => doc._id);
  await DocumentChunk.deleteMany({ documentId: { $in: docIds } });
  await Document.deleteMany({ _id: { $in: docIds } });
};

const indexJdText = async (userId, text, fileName) => {
  const chunks = await processJdDocument(text);

  if (chunks.length === 0) {
    return {
      error: {
        status: 400,
        body: {
          success: false,
          message:
            "Could not extract usable text from this job description. Provide at least 20 characters of content.",
        },
      },
    };
  }

  const document = new Document({
    userId,
    type: "jd",
    fileName,
    extractedText: text,
    sectionsCount: 1,
    vectorsCount: chunks.length,
    sectionTypes: ["Requirements"],
  });

  await Promise.all(
    chunks.map((chunk) =>
      DocumentChunk.create({
        userId,
        documentId: document._id,
        content: chunk.content,
        embedding: chunk.embedding,
        section: chunk.section,
        title: chunk.title,
        documentName: document.fileName,
        chunkType: "jd",
      }),
    ),
  );

  await document.save();
  return { document };
};

export const uploadJd = async (req, res) => {
  try {
    let text = "";
    let fileName = "pasted-jd.txt";

    if (req.file) {
      text = await extractPdfText(req.file.buffer || req.file.path);
      fileName = req.file.filename || req.file.originalname;
    } else if (req.body?.text && typeof req.body.text === "string") {
      text = req.body.text.trim();
      fileName = req.body.fileName?.trim() || "pasted-jd.txt";
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide a PDF file or JSON body with a text field.",
      });
    }

    if (!text || text.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Job description text must be at least 20 characters.",
      });
    }

    await purgeExistingJds(req.user.id);

    const result = await indexJdText(req.user.id, text, fileName);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    const { document } = result;
    return res.status(201).json({
      success: true,
      document: {
        _id: document._id,
        fileName: document.fileName,
        vectorsCount: document.vectorsCount,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getJd = async (req, res) => {
  try {
    const document = await Document.findOne({
      userId: req.user.id,
      type: "jd",
    }).select("-extractedText");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "No saved job description found.",
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

export const getJdText = async (req, res) => {
  try {
    const document = await Document.findOne({
      userId: req.user.id,
      type: "jd",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "No saved job description found.",
      });
    }

    return res.status(200).json({
      success: true,
      extractedText: document.extractedText,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteJd = async (req, res) => {
  try {
    await purgeExistingJds(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Saved job description purged successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
