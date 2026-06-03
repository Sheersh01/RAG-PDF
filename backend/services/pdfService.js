import fs from "fs";
import { PDFParse } from "pdf-parse";

const readPdfText = async (fileInput) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("PDF text extraction timed out after 30 seconds."));
    }, 30000);

    try {
      let dataBuffer;
      if (Buffer.isBuffer(fileInput)) {
        dataBuffer = fileInput;
      } else if (typeof fileInput === "string") {
        dataBuffer = fs.readFileSync(fileInput);
      } else {
        throw new Error("Invalid file input: must be path string or Buffer.");
      }
      
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
