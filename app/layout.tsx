import "./globals.css";
import Navbar from "./components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sup-Connect - Supervisor Booking & Project Management",
  description: "Find and connect with your perfect academic supervisor for your final-year project",
  keywords: ["supervisor", "project", "final-year", "academic", "booking"],
  authors: [{ name: "Sup-Connect Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
