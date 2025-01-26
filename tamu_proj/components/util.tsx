"use client";

import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import Papa from "papaparse";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
import { Line } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Util = () => {
  const [selectedCategory, setSelectedCategory] = useState("Purchases");
  const [utilityData, setUtilityData] = useState<any[]>([]);
  const [utilityTransactions, setUtilityTransactions] = useState<any[]>([]);
  const [showAllUtilities, setShowAllUtilities] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    loadCSVData("/chatbot/utilitiesFinal.csv"); // Load initial historical data
  }, []);

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
        setSelectedFile(null); // Reset file input
        setCameraOpen(false);
        updateWithNewCSV("/uv.csv"); 
      }
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      updateWithNewCSV("/uv.csv"); // Load the new CSV to update the graph and transactions
    }
  };

  const loadCSVData = async (filePath: string) => {
    const response = await fetch(filePath);
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any) => ({
          ...row,
          "kWh Electricity Used": Number(row["kWh Electricity Used"]),
          "CO2 Emmisions Avoided": Number(row["CO2 Emmisions Avoided"]),
          "Amount Due": Number(row["Amount Due"]),
          eScore: calculateEScore(
            Number(row["kWh Electricity Used"]),
            Number(row["CO2 Emmisions Avoided"])
          ),
        }));

        setUtilityData((prevData) => [...prevData, ...parsedData]); // Append new data to the graph
        setUtilityTransactions((prevTransactions) => [
          ...prevTransactions,
          ...parsedData,
        ]);
      },
    });
  };

  const updateWithNewCSV = async (filePath: string) => {
    // Load new data from the given CSV path
    loadCSVData(filePath);
  };

  const calculateEScore = (kWh: number, co2Avoided: number): number => {
    const maxScore = 100;
    const kWhWeight = 0.6; // Weightage for kWh Electricity Used
    const co2Weight = 0.4; // Weightage for CO2 Emissions Avoided

    const normalizedKWh = Math.max(0, Math.min(1 - kWh / 1000, 1)); // Normalize to [0, 1]
    const normalizedCO2 = Math.max(0, Math.min(co2Avoided / 1000, 1)); // Normalize to [0, 1]

    return Math.round(
      (normalizedKWh * kWhWeight + normalizedCO2 * co2Weight) * maxScore
    );
  };

  const chartData = {
    labels: utilityData.map((item) => item["Date Due"]),
    datasets: [
      {
        label: "kWh Electricity Used",
        data: utilityData.map((item) => item["kWh Electricity Used"]),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: "CO2 Emissions Avoided",
        data: utilityData.map((item) => item["CO2 Emmisions Avoided"]),
        borderColor: "green",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-200 py-4 px-4">


        <>
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
              accept=".png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h4 className="text-md font-medium text-gray-600 mb-4">
              kWh Electricity Used and CO2 Emissions Avoided
            </h4>
            {chartData && (
              <div style={{ height: "400px" }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: true, text: "Utility Trends" },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {(showAllUtilities
              ? utilityTransactions
              : utilityTransactions.slice(0, 5)
            ).map((transaction, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <p className="text-gray-800 font-medium">Utility Bill</p>
                  <p className="text-sm text-gray-500">
                    {transaction["Date Due"]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-bold">
                    ${transaction["Amount Due"].toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    E Score: {transaction.eScore}
                  </p>
                </div>
              </div>
            ))}
            {!showAllUtilities ? (
              <button
                onClick={() => setShowAllUtilities(true)}
                className="text-blue-600 font-medium hover:underline text-sm"
              >
                See More
              </button>
            ) : (
              <button
                onClick={() => setShowAllUtilities(false)}
                className="text-blue-600 font-medium hover:underline text-sm"
              >
                See Less
              </button>
            )}
          </div>
        </>
        <div className="h-16">

        </div>
    </div>
  );
};

export default Util;