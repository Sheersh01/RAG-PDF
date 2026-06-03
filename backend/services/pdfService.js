import fs from "fs";
import { PDFParse } from "pdf-parse";

const readPdfText = async (filePath) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("PDF text extraction timed out after 30 seconds."));
    }, 30000);

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });

      parser.getText()
        .then((data) => {
          clearTimeout(timeout);
          resolve(data.text);
        })
        .catch((err) => {
          clearTimeout(timeout);
          reject(err);
        });
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

export const extractPdfText = readPdfText;
export const extractTextFromPdf = readPdfText;
