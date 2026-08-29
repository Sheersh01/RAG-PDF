import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { extractPdfText } from "../services/pdfService.js";
import { processDocument } from "../rag/processDocument.js";

const computeQualityScore = (text, uniqueSections) => {
  let qualityScore = 70;
  if (text.length > 1000) qualityScore += 10;
  if (text.length > 2500) qualityScore += 10;

  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(text);
  if (hasEmail) qualityScore += 5;
  if (hasPhone) qualityScore += 5;

  if (uniqueSections.has("Experience")) qualityScore += 5;
  if (uniqueSections.has("Education")) qualityScore += 5;
  if (uniqueSections.has("Skills")) qualityScore += 5;

  return Math.min(100, Math.max(50, qualityScore));
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const text = await extractPdfText(req.file.buffer || req.file.path);

    const existingResumes = await Document.find({ userId: req.user.id, type: "resume" });
    if (existingResumes.length > 0) {
      const docIds = existingResumes.map((doc) => doc._id);
      await DocumentChunk.deleteMany({ documentId: { $in: docIds } });
      await Document.deleteMany({ _id: { $in: docIds } });
    }

    const document = new Document({
      userId: req.user.id,
      type: "resume",
      fileName: req.file.filename || req.file.originalname,
      extractedText: text,
    });

    const chunks = await processDocument(text);

    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract usable text from this PDF. Ensure the file contains selectable text (not a scanned image).",
      });
    }

    const uniqueSections = new Set(chunks.map((c) => c.section));
    const sectionsCount = uniqueSections.size || 1;
    const vectorsCount = chunks.length;
    const quality = computeQualityScore(text, uniqueSections);

    document.sectionsCount = sectionsCount;
    document.vectorsCount = vectorsCount;
    document.quality = quality;
    document.sectionTypes = [...uniqueSections];

    await Promise.all(
      chunks.map((chunk) =>
        DocumentChunk.create({
          userId: req.user.id,
          documentId: document._id,
          content: chunk.content,
          embedding: chunk.embedding,
          section: chunk.section,
          title: chunk.title,
          documentName: document.fileName,
          chunkType: "resume",
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

export const getResumeStats = async (req, res) => {
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

    const chunkSections = await DocumentChunk.distinct("section", {
      userId: req.user.id,
      documentId: document._id,
    });

    const activity = [
      {
        type: "upload",
        label: "Resume uploaded",
        detail: document.fileName,
        timestamp: document.createdAt,
      },
    ];

    if (document.lastAnalysisAt) {
      activity.push({
        type: "analysis",
        label: "Resume analyzed",
        detail: document.cachedStrength || "Analysis completed",
        timestamp: document.lastAnalysisAt,
      });
    }

    if (document.lastAtsAt) {
      activity.push({
        type: "ats",
        label: "ATS score calculated",
        detail: document.lastAtsScore != null ? `${document.lastAtsScore}% match` : "ATS check completed",
        timestamp: document.lastAtsAt,
      });
    }

    if (document.lastChatAt) {
      activity.push({
        type: "chat",
        label: "AI Coach session",
        detail: "Asked a question about your resume",
        timestamp: document.lastChatAt,
      });
    }

    if (document.mockInterviewCount > 0) {
      activity.push({
        type: "interview",
        label: "Mock interview started",
        detail: `${document.mockInterviewCount} session${document.mockInterviewCount > 1 ? "s" : ""}`,
        timestamp: document.updatedAt,
      });
    }

    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const insights = [];
    if (document.cachedStrength) {
      insights.push({
        type: "strength",
        title: document.cachedStrength,
        subtitle: "From your latest resume analysis",
        link: "/resume-analyzer",
      });
    }
    if (document.cachedImprovement) {
      insights.push({
        type: "improvement",
        title: document.cachedImprovement,
        subtitle: "Suggested improvement from analysis",
        link: "/resume-analyzer",
      });
    }
    if (document.cachedAtsKeyword) {
      insights.push({
        type: "ats",
        title: document.cachedAtsKeyword,
        subtitle: "Keyword gap from ATS matching",
        link: "/ats-matcher",
      });
    }

    if (insights.length === 0) {
      insights.push(
        {
          type: "action",
          title: "Run your first resume analysis",
          subtitle: "Get AI-powered strengths and improvement suggestions",
          link: "/resume-analyzer",
        },
        {
          type: "action",
          title: "Try ATS keyword matching",
          subtitle: "Paste a job description to check compatibility",
          link: "/ats-matcher",
        },
      );
    }

    return res.status(200).json({
      success: true,
      stats: {
        sectionsCount: document.sectionsCount,
        vectorsCount: document.vectorsCount,
        quality: document.quality,
        sectionTypes: chunkSections.length > 0 ? chunkSections : document.sectionTypes,
        uploadedAt: document.createdAt,
        lastAnalysisAt: document.lastAnalysisAt,
        lastAtsScore: document.lastAtsScore,
        lastAtsAt: document.lastAtsAt,
        lastChatAt: document.lastChatAt,
        mockInterviewCount: document.mockInterviewCount,
      },
      insights,
      activity: activity.slice(0, 5),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getResumeText = async (req, res) => {
  try {
    const document = await Document.findOne({
      userId: req.user.id,
      type: "resume",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "No resume found.",
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

export const deleteResume = async (req, res) => {
  try {
    const existingResumes = await Document.find({ userId: req.user.id, type: "resume" });
    if (existingResumes.length > 0) {
      const docIds = existingResumes.map((doc) => doc._id);
      await DocumentChunk.deleteMany({ documentId: { $in: docIds } });
      await Document.deleteMany({ _id: { $in: docIds } });
    }
    return res.status(200).json({
      success: true,
      message: "Workspace resume purged successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
