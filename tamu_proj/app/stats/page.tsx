"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import RechartsWrapper to disable SSR
const RechartsWrapper = dynamic(() => import("@/components/recharts"), { ssr: false });

const Analytics = () => {
  const spendingData = [
    { name: "Grocery", value: 400 },
    { name: "Dining", value: 200 },
    { name: "Transportation", value: 150 },
    { name: "Entertainment", value: 100 },
    { name: "Others", value: 50 },
  ];

  const trendsData = [
    { month: "Sep", spending: 600 },
    { month: "Oct", spending: 700 },
    { month: "Nov", spending: 800 },
    { month: "Dec", spending: 900 },
    { month: "Jan", spending: 750 },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#d0ed57"];

  return (
    <div className="min-h-screen bg-gray-200 py-4 px-4">
      <RechartsWrapper spendingData={spendingData} trendsData={trendsData} COLORS={COLORS} />
    </div>
  );
};

export default Analytics;
