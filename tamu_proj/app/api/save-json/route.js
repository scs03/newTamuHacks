import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { jsonContent, fileName } = await req.json();

    // Validate input
    if (!jsonContent || !fileName) {
      return NextResponse.json({ error: "Missing jsonContent or fileName" }, { status: 400 });
    }

    // Path to save the file
    const filePath = path.join(process.cwd(), fileName);

    // Write the JSON content to a file
    fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2));

    return NextResponse.json({ message: "File saved successfully", filePath }, { status: 200 });
  } catch (error) {
    console.error("Error saving JSON:", error);
    return NextResponse.json({ error: "Failed to save JSON file" }, { status: 500 });
  }
}
