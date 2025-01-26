"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const RechartsWrapper = ({ spendingData, trendsData, COLORS }) => {
  return (
    <div>
      {/* Spending Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Total January Spending</h2>
        <div className="flex flex-col items-center">
          <PieChart width={300} height={300}>
            <Pie
              data={spendingData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {spendingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <p className="mt-4 text-lg font-bold">$900</p>
          <p className="text-sm text-gray-500">As of January 25, 2025</p>
        </div>
      </div>

      {/* Spending Trends */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="spending" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RechartsWrapper;
