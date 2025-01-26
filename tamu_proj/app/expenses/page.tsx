"use client";

import React from "react";
import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { detectTextFromImage } from "../api/analyze-receipts";

export type TextDetection = {
  DetectedText?: string;
  Confidence?: number;
  Type?: string;
  Id?: number;
  ParentId?: number;
};

type JsonResponseType = {
  TextDetections?: TextDetection[];
  error?: string;
};

const esgScoreMapping: { [key: string]: number } = {
  a: 4,
  b: 3,
  c: 2,
  d: 1,
};

const reverseEsgScoreMapping: { [key: number]: string } = {
  4: "A",
  3: "B",
  2: "C",
  1: "D",
};

const Expenses = () => {
  const [selectedCategory, setSelectedCategory] = useState("Purchases");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredResult, setFilteredResult] = useState<string[] | null>(null);
  const [esgResults, setEsgResults] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);

  const openCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Please allow camera permissions in your browser.");
    }
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setSelectedFile(null); // Clear uploaded file if live image is taken
        setCameraOpen(false); // Close the camera
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFetchEsgRatings();
      setSelectedFile(file);
      setCapturedImage(null); // Clear captured image if a file is uploaded
    }

  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleFetchEsgRatings = async () => {
    setIsLoading(true);

    try {
      const bucketName = "tamuhackreciept";
      const imageName = "g4.jpg";

      // Step 1: Detect text from the image
      const textDetections = await detectTextFromImage(bucketName, imageName);

      // Step 2: Filter detected text to hardcoded products
      const hardcodedProducts = ["Almond Milk", "Corn Flakes", "Jif Creamy", "Pirate's Booty"];
      setFilteredResult(hardcodedProducts);

      // Step 3: Fetch ESG ratings for the filtered products
      const res = await fetch("/api/fetch-esg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: hardcodedProducts }),
      });
      console.log("FETCH");


      if (!res.ok) {
        throw new Error(`Failed to fetch ESG data: ${res.statusText}`);
      }

      const data = await res.json();
      setEsgResults(data.results);

      // Step 4: Calculate the average ESG rating
      const validScores = data.results
        .map((item: any) => esgScoreMapping[item.esgScore.toLowerCase()])
        .filter((score: number | undefined) => score !== undefined);

      if (validScores.length > 0) {
        const average = validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length;

        // Map back to the letter grade
        const roundedAverage = Math.round(average); // Round to the nearest integer
        setAverageRating(reverseEsgScoreMapping[roundedAverage] || "Unknown");
      } else {
        setAverageRating(null); // No valid scores found
      }
    } catch (error) {
      console.error("Error in processing ESG ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 h-screen ">
      <div className="dropdown dropdown-bottom">
        <select
          id="category"
          value={selectedCategory}
          onChange={handleSelectionChange}
          className="p-2 border rounded-md"
        >
          <option value="Purchases">Purchases</option>
          <option value="Utilities">Utilities</option>
        </select>
      </div>

      {selectedCategory === "Purchases" && (
        <div className="w-full mt-4">
          <div className="flex justify-center">
            <button
              className="p-2 m-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg mr-14"
              onClick={() => (cameraOpen ? setCameraOpen(false) : openCamera())}
            >
              Open Webcam
            </button>
            <label
              htmlFor="fileInput"
              className="p-2 m-2 bg-green-500 ml-14 text-white rounded cursor-pointer"
            >
              Upload File
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {cameraOpen && (
            <div className="m-4 rounded-xl border p-2 bg-sky-900 h-64 flex justify-center items-center">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg"
              />
              <button
                className="p-2 mt-2 bg-red-500 text-white rounded"
                onClick={handleCapture}
              >
                {capturedImage ? "Close" : "Capture"}
              </button>
            </div>
          )}

          {capturedImage && (
            <div className="m-4 rounded-xl border p-2 bg-gray-100">
              <p>Captured Image:</p>
              <img src={capturedImage} alt="Captured" className="rounded-lg" />
            </div>
          )}

          {selectedFile && (
            <div className="m-4 rounded-xl border p-2 bg-gray-100">
              <p>Uploaded File:</p>
              <p>{selectedFile.name}</p>
            </div>
          )}

<div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">ESG Ratings</h1>
      <button
        onClick={handleFetchEsgRatings}
        className={`px-4 py-2 bg-purple-500 text-white rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Fetch ESG Ratings"}
      </button>

      {isLoading && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-purple-500 h-2.5 rounded-full animate-marquee"
            style={{
              animation: "marquee 2s linear infinite",
            }}
          ></div>
          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      )}

      {filteredResult && !isLoading && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Filtered Products:</h2>
          <ul className="list-disc ml-5">
            {filteredResult.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {esgResults.length > 0 && !isLoading && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">ESG Ratings:</h2>
          <ul className="list-disc ml-5">
            {esgResults.map((item, index) => (
              <li key={index}>
                <strong>{item.name}:</strong> ESG Score: {item.esgScore}
              </li>
            ))}
          </ul>
        </div>
      )}

      {averageRating && !isLoading && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Average ESG Rating:</h2>
          <p className="text-lg">
            <strong>{averageRating}</strong>
          </p>
        </div>
      )}
    </div>
        
        {(selectedFile || capturedImage) && (
            <div className="mt-4 w-full">
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-6 shadow-md mx-4">
                    <p className="text-sm font-medium" >ESG Evaluation:</p>
                    <table className="w-full border-collapse  border-gray-400 mt-2">
                        <thead>
                            <tr>
                                <th className=" border-gray-400 px-4 py-2">Item</th>
                                <th className=" border-gray-400 px-4 py-2">ESG Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className=" border-gray-400 px-4 py-2">Apple</td>
                                <td className=" border-gray-400 px-4 py-2">37</td>
                            </tr>
                            <tr>
                                <td className=" border-gray-400 px-4 py-2">Banana</td>
                                <td className=" border-gray-400 px-4 py-2">48</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )}


        {/* <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md space-y-4 m-4" >
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">History:</h2>
            </div>
            <div className="collapse bg-base-200">
                <input type="radio" name="my-accordion-1" />
                <div className="collapse-title text-xl font-medium">
                Jan 24, 2025
                </div>
                    <div className="collapse-content">
                        <p>

                        </p>
                    </div>
                </div>
                <div className="collapse bg-base-200">
                    <input type="radio" name="my-accordion-1" />
                    <div className="collapse-title text-xl font-medium">
                        Jan 20, 2025
                    </div>
                    <div className="collapse-content">
                        <p>

                        </p>
                    </div>
                </div>
                <div className="collapse bg-base-200">
                    <input type="radio" name="my-accordion-1" />
                    <div className="collapse-title text-xl font-medium">

                        <span>

                        </span>
                    </div>
                    <div className="collapse-content">
                        <p>
                            
                        </p>
                    </div>
                </div>
            </div> */}


<div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md space-y-4 m-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-gray-800">Recent Transactions:</h2>
    <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
      View All
    </a>
  </div>

  {/* Transactions */}
  <div className="space-y-4">
    {/* Transaction 1 */}
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="text-gray-800 font-medium">Walmart</p>
        <p className="text-sm text-gray-500">Grocery</p>
        <p className="text-sm text-gray-400">January 3</p>
      </div>
      <p className="text-gray-800 font-semibold">$6.47</p>
    </div>

    {/* Transaction 2 */}
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="text-gray-800 font-medium">McDonald's</p>
        <p className="text-sm text-gray-500">Dining</p>
        <p className="text-sm text-gray-400">December 31</p>
      </div>
      <p className="text-gray-800 font-semibold">$8.31</p>
    </div>

    {/* Transaction 3 */}
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="text-gray-800 font-medium">TST* Village Burger BA</p>
        <p className="text-sm text-gray-500">Dining</p>
        <p className="text-sm text-gray-400">December 16</p>
      </div>    
      <p className="text-gray-800 font-semibold">$10.77</p>
    </div>

    {/* Transaction 4 */}
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="text-gray-800 font-medium">Ulta Beauty</p>
        <p className="text-sm text-gray-500">Merchandise</p>
        <p className="text-sm text-gray-400">December 14</p>
      </div>
      <p className="text-gray-800 font-semibold">$36.54</p>
    </div>

    {/* Transaction 5 */}
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-800 font-medium">Five Below</p>
        <p className="text-sm text-gray-500">Merchandise</p>
        <p className="text-sm text-gray-400">December 13</p>
      </div>
      <p className="text-gray-800 font-semibold">$35.45</p>
    </div>
  </div>

  {/* View All Transactions Button */}
  <div className="text-center mt-4">
    <a
      href="#"
      className="text-blue-600 font-medium hover:underline text-sm"
    >
      View All Transactions
    </a>
  </div>
</div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
