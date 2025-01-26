"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const RechartsWrapper = ({ spendingData, trendsData, COLORS }) => {
  return (
    <div>
      {/* Spending Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 bg-transparent mb-4">Total January Spending</h2>
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


      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Spending Categories</h2>
        <div className="space-y-4">
          {spendingData.map((category, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-2"
            >
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full mr-4"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <p className="text-gray-800 font-medium">{category.name}</p>
              </div>
              <p className="text-gray-800 font-bold">${category.value}</p>
            </div>
          ))}
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Life Plan</h2>
        <p className="text-gray-600 mb-4">
          Life happens. Let's plan for it. Review your priorities and events, and
          see how you're tracking to your goals.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md">
          Review My Life Plan
        </button>
      </div>
      <div className="h-16">

      </div>
    </div>
  );
};

export default RechartsWrapper;
