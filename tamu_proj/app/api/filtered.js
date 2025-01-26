import fs from "fs";
import path from "path";

export const filterJsonFile = (jsonResponse) => {
  try {
    // If jsonResponse is provided, use it; otherwise, read from the JSON file
    let ocrResponse = jsonResponse;
    if (!ocrResponse) {
      // Path to the Rekognition JSON file
      const filePath = path.join(process.cwd(), "rekognitionResult.json");

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error("File 'rekognitionResult.json' not found.");
        return;
      }

      // Read and parse the JSON file
      const rawData = fs.readFileSync(filePath, "utf-8");
      ocrResponse = JSON.parse(rawData);
    }

    // Perform the filtering
    const productNames = extractProductNames(ocrResponse);

    // Display the filtered product names
    console.log("Filtered Product Names:");
    productNames.forEach((name) => console.log(name));
  } catch (error) {
    console.error("Error filtering JSON file:", error.message);
  }
};

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
