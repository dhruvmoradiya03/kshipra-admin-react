"use client";

import Sidebar from "@/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("idToken") : null;

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="w-[80%] border">{children}</main>
    </div>
  );
}
