import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { extractCandidateInfoFromResume } from "./aiService";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
};

export const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
};

export const extractCandidateInfo = async (text) => {
  try {
    // Try AI extraction first
    console.log("Attempting AI extraction...");
    const aiExtractedInfo = await extractCandidateInfoFromResume(text);

    // Check if AI extraction was successful (at least one field found)
    const hasAnyInfo =
      aiExtractedInfo.name || aiExtractedInfo.email || aiExtractedInfo.phone;

    if (hasAnyInfo) {
      console.log("AI extraction successful:", aiExtractedInfo);
      return aiExtractedInfo;
    } else {
      console.log("AI extraction found no info, falling back to regex...");
    }
  } catch (error) {
    console.warn("AI extraction failed, falling back to regex:", error.message);
  }

  // Fallback to regex-based extraction
  console.log("Using regex fallback extraction...");
  return extractCandidateInfoRegex(text);
};

export const extractCandidateInfoRegex = (text) => {
  const info = {
    name: "",
    email: "",
    phone: "",
  };

  // More flexible email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // More flexible phone regex
  const phoneRegex =
    /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  // More flexible name regex
  const nameRegex = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+/;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Extract email
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }

  // Extract name - try multiple approaches
  for (const line of lines.slice(0, 10)) {
    if (nameRegex.test(line) && !info.name) {
      info.name = line;
      break;
    }
  }

  // If no name found with regex, try to get the first line that looks like a name
  if (!info.name) {
    for (const line of lines.slice(0, 5)) {
      const words = line.split(" ");
      if (
        words.length >= 2 &&
        words.every((word) => /^[A-Z][a-z]+$/.test(word))
      ) {
        info.name = line;
        break;
      }
    }
  }

  console.log("Regex extracted info:", info);
  return info;
};

export const getMissingFields = (candidateInfo) => {
  const missing = [];
  if (!candidateInfo.name) missing.push("name");
  if (!candidateInfo.email) missing.push("email");
  if (!candidateInfo.phone) missing.push("phone");
  return missing;
};
