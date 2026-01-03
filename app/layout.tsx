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
import { ModalProvider } from "./context/ModalContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900`}>
        <ToastProvider>
          <ModalProvider>
            <Navbar />
            {children}
          </ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
