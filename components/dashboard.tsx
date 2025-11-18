"use client";

import Sidebar from "./sidebar";

const Dashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Sidebar />
      <main className="w-[80%]">{children}</main>
    </div>
  );
};

export default Dashboard;
