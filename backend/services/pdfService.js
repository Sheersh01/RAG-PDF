import fs from "fs";
import { PDFParse } from "pdf-parse";

const readPdfText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();

  console.log(data.text);

  return data.text;
};

export const extractPdfText = readPdfText;
export const extractTextFromPdf = readPdfText;
