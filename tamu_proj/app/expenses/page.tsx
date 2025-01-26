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

  const transactions = [
    { name: "Trader Joe's", category: "Grocery", date: "January 3", amount: "$34.67", esg: "A" },
    { name: "Whole Foods", category: "Grocery", date: "December 31", amount: "$50.31", esg: "B" },
    { name: "Aldi", category: "Grocery", date: "December 16", amount: "$25.77", esg: "A" },
    { name: "Walmart", category: "Grocery", date: "December 14", amount: "$63.54", esg: "C" },
    { name: "Kroger", category: "Grocery", date: "December 13", amount: "$45.45", esg: "B" },
  ];

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    if (!groups[transaction.date]) {
      groups[transaction.date] = [];
    }
    groups[transaction.date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

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
          <div className="flex justify-center gap-4 mb-6">
          <button
              className="p-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-md"
              onClick={() => (cameraOpen ? setCameraOpen(false) : openCamera())}
            >
              Open Webcam
            </button>
            <label
              htmlFor="fileInput"
              className="p-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-md"
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
            <div className="rounded-lg border p-4 bg-white shadow-md flex flex-col items-center justify-center mb-6">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg w-full max-w-sm"
              />
              <button
                className="p-2 mt-4 bg-red-500 text-white rounded-lg w-full max-w-xs"
                onClick={handleCapture}
              >
                {capturedImage ? "Close Camera" : "Capture"}
              </button>
            </div>
          )}

          {/* Captured Image Display */}
          {capturedImage && (
            <div className="rounded-lg border p-4 bg-gray-100 mb-6">
              <p className="font-medium mb-2">Captured Image:</p>
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
      {/* <h1 className="text-xl font-bold mb-4">ESG Ratings</h1>
      <button
        onClick={handleFetchEsgRatings}
        className={`px-4 py-2 bg-purple-500 text-white rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Fetch ESG Ratings"}
      </button> */}

      {isLoading && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-700 to-blue-900 h-2.5 rounded-full animate-marquee"
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

      {/* {filteredResult && !isLoading && (
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
      )} */}

      {/* {averageRating && !isLoading && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Average ESG Rating:</h2>
          <p className="text-lg">
            <strong>{averageRating}</strong>
          </p>
        </div>
      )} */}
    </div>
        
    {(selectedFile || capturedImage) && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-6 shadow-md mx-4">
                <p className="text-lg font-medium mb-4">Average ESG: <strong className="text-xl ">{averageRating}</strong></p>
                <table className="w-full border-collapse border-gray-400">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-300 px-4 py-2 text-left">
                        Item
                      </th>
                      <th className="border-b border-gray-300 px-4 py-2 text-left">
                        ESG Score: 
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {esgResults.map((item, index) => (
                      <tr key={index}>
                        <td className="border-t border-gray-300 px-4 py-2">{item.name}</td>
                        <td className="border-t border-gray-300 px-4 py-2">{item.esgScore.toUpperCase()}</td>
                      </tr>
                    ))}
                    {/* <tr>
                      <td className="border-t border-gray-300 px-4 py-2">
                        Apple
                      </td>
                      <td className="border-t border-gray-300 px-4 py-2">A</td>
                    </tr>
                    <tr>
                      <td className="border-t border-gray-300 px-4 py-2">
                        Banana
                      </td>
                      <td className="border-t border-gray-300 px-4 py-2">B</td>
                    </tr> */}
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




  {/* Transactions */}
  <div className="bg-white rounded-lg shadow-md p-6 mx-4 mt-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Recent Transactions:
      </h2>
      <a
        href="#"
        className="text-blue-600 font-medium text-sm hover:underline"
      >
        View All
      </a>
    </div>

    {/* Grouped Transactions by Date */}
    <div className="space-y-4">
    {averageRating && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">January 26</h3>
          <div className="divide-y divide-gray-300 bg-gray-100 p-4 rounded-md">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-gray-800 font-medium">Walmart</p>
                <p className="text-sm text-gray-500">Grocery</p>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-bold">$32.47</p>
                <p className="text-sm text-gray-500">ESG Score: {averageRating}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">{date}</h3>
          <div className="divide-y divide-gray-300 bg-gray-100 p-4 rounded-md">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <p className="text-gray-800 font-medium">
                    {transaction.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-bold">
                    {transaction.amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    ESG Score: {transaction.esg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* View All Transactions Link */}
    <div className="text-center mt-4 ">
      <a
        href="#"
        className="text-blue-600 font-medium hover:underline text-sm"
      >
        View All Transactions
      </a>
    </div>
  </div>

  <div className="mb-16 h-20">

  </div>

</div>
      )}
    </div>
  );
};

export default Expenses;
