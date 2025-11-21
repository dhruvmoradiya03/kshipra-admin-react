"use client";

import Sidebar from "@/components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-[80%] border">{children}</main>
    </div>
  );
}
