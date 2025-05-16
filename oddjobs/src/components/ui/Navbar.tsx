// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between p-4 shadow-md bg-white dark:bg-gray-900">
      <Link href="/" className="text-xl font-bold text-blue-600">
        ODDJobs
      </Link>
      <div className="space-x-3">
        <Link href="/auth">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      </div>
    </nav>
  );
}
