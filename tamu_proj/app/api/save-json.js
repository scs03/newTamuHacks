import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { jsonContent, fileName } = await req.json();

    // Validate the incoming data
    if (!jsonContent || !fileName) {
      return NextResponse.json({ error: "Missing jsonContent or fileName" }, { status: 400 });
    }

    // Path to save the JSON file in the `tamuhack` directory
    const filePath = path.join(process.cwd(), fileName);

    // Write the JSON data to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), "utf-8");

    return NextResponse.json({ message: "File saved successfully", filePath }, { status: 200 });
  } catch (error) {
    console.error("Error saving JSON:", error);
    return NextResponse.json({ error: "Failed to save JSON file" }, { status: 500 });
  }
}
