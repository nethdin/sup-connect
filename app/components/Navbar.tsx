"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between">
      <h1 className="font-bold text-xl">SUP-CONNECT</h1>
      <div className="space-x-6">
        <Link href="/">Home</Link>
        <Link href="/register/student">Student</Link>
        <Link href="/register/supervisor">Supervisor</Link>
      </div>
    </nav>
  );
}
