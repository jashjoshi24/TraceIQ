"use client";

import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/Guards";

// Everything under this route group (/, /pcap, /profile, /users, /roles)
// requires a logged-in session and gets the existing dashboard chrome
// (TopNav + Sidebar) - moved here from the root layout so /login and the
// other (auth) pages render without them.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full flex-col bg-[#0b0c10] text-gray-100 font-sans overflow-hidden">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#0b0c10] scrollbar-thin scrollbar-thumb-gray-800 relative flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
