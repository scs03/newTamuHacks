"use client";

import React from "react";
import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { detectTextFromImage } from "../api/analyze-receipts";
import Util from '@/components/util';

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

    console.log("FETCHED", esgResults, averageRating);
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
          className="p-2  mt-2 bg-transparent text-blue-700 text-2xl font-semibold rounded-md"
        >
          <option value="Purchases">PURCHASES</option>
          <option value="Utilities">UTILITIES</option>
        </select>
      </div>

      {selectedCategory === "Purchases" && (
        <div className="w-full">
          <div className="flex justify-center item-center gap-4 h-32 px-4 mt-2">
          <button
              className="p-2 w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-md"
              onClick={() => (cameraOpen ? setCameraOpen(false) : openCamera())}
            >
              <div className="flex justify-center">

                <svg className="w-12 h-12 align-middle  text-gray-300 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/>
                  <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <p className="w-full text-center">Snap</p>
            </button>
            <label
              htmlFor="fileInput"
              className="p-2 w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg shadow-md"
            >
              <div className="flex justify-center">
              <svg className="w-12 h-12 align-middle text-gray-300 mt-6 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"/>
              </svg>
              </div>
              <p className="w-full text-center">Upload</p>
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
                  </tbody>
                </table>
              </div>
            </div>
          )}



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
        <div className="">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">January 26</h3>
          <div className={`divide-y divide-gray-300 bg-gray-100 p-4 rounded-md shadow ${averageRating === 'A' || averageRating === 'B' ? 'shadow-blue-700' : 'shadow-red-700'}`}>
            <div className="flex justify-between items-center py-2 ">
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
            {transactions.map((transaction, index) => (
          <div 
            key={`${date}-${index}`}
            className={`divide-y divide-gray-300 bg-gray-100 shadow p-4 rounded-md ${
            transaction.esg === 'A' || transaction.esg === 'B'
              ? 'shadow-blue-700'
              : 'shadow-red-700'
          }`}
        >
              <div
                key={index}
                className={`flex justify-between items-center py-2 ${transaction.esg === 'A' || transaction.esg === 'B' ? 'shadow-blue-700' : 'shadow-red-700'}`}
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
          </div>
            ))}
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
      { selectedCategory === 'Utilities' && (
        <Util />
      )}
    </div>
  );
};

export default Expenses;
