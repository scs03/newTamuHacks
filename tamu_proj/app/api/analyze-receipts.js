import { RekognitionClient, DetectTextCommand } from "@aws-sdk/client-rekognition";
require('dotenv').config();
console.log("Access Key:", process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID);
console.log("Secret Key:", process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY);
console.log("Region:", process.env.NEXT_PUBLIC_AWS_REGION);
const client = new RekognitionClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

export const detectTextFromImage = async (bucketName, imageName) => {
  try {
    const command = new DetectTextCommand({
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: imageName,
        },
      },
    });
    
    const response = await client.send(command);
    return response.TextDetections || [];
  } catch (error) {
    console.error("Error detecting text:", error);
    return [];
  }
};