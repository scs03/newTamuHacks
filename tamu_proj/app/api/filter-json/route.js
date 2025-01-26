import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Path to the Rekognition JSON file
    const filePath = path.join(process.cwd(), "rekognitionResult.json");

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File 'rekognitionResult.json' not found." }, { status: 404 });
    }

    // Read and parse the JSON file
    const rawData = fs.readFileSync(filePath, "utf-8");
    const ocrResponse = JSON.parse(rawData);

    // Perform the filtering
    const filteredData = extractProductNames(ocrResponse);

    return NextResponse.json({ filteredData });
  } catch (error) {
    console.error("Error filtering JSON file:", error.message);
    return NextResponse.json({ error: "Failed to filter JSON file." }, { status: 500 });
  }
}

// Helper function to extract product names
const extractProductNames = (ocrResponse) => {
  const productNames = [];
  let stopExtraction = false;

  for (const detection of ocrResponse.TextDetections || []) {
    const text = detection.DetectedText?.trim();

    // Stop when encountering "Subtotal"
    if (text && text.toUpperCase().includes("SUBTOTAL")) {
      stopExtraction = true;
    }

    // Skip lines after "Subtotal" or irrelevant patterns
    if (stopExtraction || ["1", "F", "T", "FW"].includes(text)) continue;

    // Skip lines containing numbers or certain formats
    if (/\b\d+(\.\d+)?\b/.test(text)) continue;

    // Remove "FW" if part of the name
    const cleanedText = text.replace(/\bFW\b/, "").trim();

    // Add uppercase names with alphabetic characters
    if (/[A-Z]/.test(cleanedText) && cleanedText === cleanedText.toUpperCase() && !cleanedText.startsWith("TOTAL")) {
      productNames.push(cleanedText);
    }
  }

  return productNames;
};
