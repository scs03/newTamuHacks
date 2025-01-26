'use client'

import Image from "next/image";
import Link from "next/link";
import { AiOutlinePlus, AiOutlineCreditCard, AiOutlineWarning } from "react-icons/ai";
import { MdOutlineTravelExplore, MdOutlineRestaurantMenu, MdTheaters } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* Capital One Logo */}
      <div className="flex justify-center mb-4">
        <Image
          src="/capitalone-logo.png"
          alt="Capital One Logo"
          width={120}
          height={30}
          priority
        />
      </div>

      {/* Cards Section */}
      <section className="space-y-6">
        {/* Quicksilver Card */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-medium">QUICKSILVER...0501</h2>
          <p className="text-4xl font-bold mt-2">$524.63</p>
          <p className="text-sm mt-1">Current balance</p>
          <button className="mt-4 flex items-center bg-white text-blue-900 px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-gray-200">
            <AiOutlineCreditCard className="mr-2" />
            Get your virtual card
          </button>
        </div>

        {/* 360 Checking Card */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-medium">360 Checking...0217</h2>
          <p className="text-4xl font-bold mt-2">$2,134.78</p>
          <p className="text-sm mt-1">Available balance</p>
          <button className="mt-4 flex items-center bg-white text-blue-800 px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-gray-200">
            <AiOutlineCreditCard className="mr-2" />
            View your debit card
          </button>
        </div>

        {/* Average ESG Score Card */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-medium">Average ESG Score</h2>
          <p className="text-4xl font-bold mt-2">42/100</p>
          <p className="text-sm mt-1">Environment, Social, Governance</p>
            <button 
            className="mt-4 flex items-center bg-white text-blue-900 px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-gray-200"
            onClick={() => router.push('./expenses')}>
              <AiOutlineCreditCard className="mr-2" />
              View your score
            </button>
        </div>

        {/* Open New Account */}
        <div className="bg-white text-blue-800 border border-gray-300 rounded-lg p-4 shadow-md flex items-center justify-between">
          <p className="text-sm font-medium">Open a new account</p>
          <button className="flex items-center bg-white text-blue-800 px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-gray-200">
            <AiOutlinePlus className="mr-2" />
          </button>
        </div>

        {/* CreditWise Card */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md space-y-4">
          {/* CreditWise Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">creditwise</h2>
            <span className="text-gray-500 text-sm">▲</span>
          </div>

          {/* Credit Score Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Your Credit Score:</span>
              <p className="text-5xl font-bold text-gray-900">757</p>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-gray-800 font-semibold">New Update Available</span>
              <span className="text-red-500 text-sm flex items-center">
                Updated: Jan 25, 2025 <AiOutlineWarning className="ml-1" />
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <div className="absolute h-2 bg-green-500 rounded-full" style={{ width: "65%" }}></div>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>300</span>
              <span>850</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="text-blue-600 font-semibold hover:underline">
              See Your New Score
            </button>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-gray-800 text-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold">Explore Rewards and Benefits</h2>
          <p className="text-3xl font-bold mt-2">$296.69</p>
          <p className="text-sm mt-1">Rewards cash</p>
          <div className="flex justify-between mt-4 space-x-4">
            <button className="flex flex-col items-center bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-blue-600">
              <MdOutlineTravelExplore className="mb-1 text-xl" />
              Travel
            </button>
            <button className="flex flex-col items-center bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-blue-600">
              <MdOutlineRestaurantMenu className="mb-1 text-xl" />
              Dining
            </button>
            <button className="flex flex-col items-center bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-blue-600">
              Entertainment
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-12">
        <p className="mt-2">CreditWise</p>
      </footer>
    </div>
  );
}