"use client";

import React from "react";
import { useState, useRef } from "react";
import Webcam from "react-webcam";

const Expenses = () => {
  const [selectedCategory, setSelectedCategory] = useState("Purchases");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

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
      setSelectedFile(file);
      setCapturedImage(null); // Clear captured image if a file is uploaded
    }
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div>
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
              className="p-2 m-2 bg-blue-500 mr-14 text-white rounded"
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

{(selectedFile || capturedImage) && (
            <div className="mt-4 w-full">
              <div className="m-4 rounded-xl bg-sky-900 text-white p-2 ">
                <p>ESG Score:</p>
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


        </div>
      )}
    </div>
  );
};

export default Expenses;
