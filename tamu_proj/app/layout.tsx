'use client'

import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
      >
        {/* Logo Section */}
        <div className="flex justify-center my-4">
          <Image
            src="/capitalone-logo.png"
            alt="Capital One Logo"
            width={120}
            height={30}
            priority
          />
        </div>

        {/* Content Section */}
        <div className="flex-grow overflow-y-auto">
          {children}
        </div>

        {/* Navbar Section */}
        <Navbar />
      </body>
    </html>
  );
}
