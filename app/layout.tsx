import "./globals.css";
import Navbar from "./components/Navbar";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Sup-Connect - Supervisor Booking & Project Management",
  description: "Find and connect with your perfect academic supervisor for your final-year project",
  keywords: ["supervisor", "project", "final-year", "academic", "booking"],
  authors: [{ name: "Sup-Connect Team" }],
};

import { Inter } from "next/font/google";
import { ToastProvider } from "./context/ToastContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900`}>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
