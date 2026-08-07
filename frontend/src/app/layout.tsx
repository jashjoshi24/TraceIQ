import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TraceIQ | SOC Dashboard",
  description: "Next Generation Security Operations Center Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex h-screen w-full flex-col bg-[#0b0c10] text-gray-100 font-sans overflow-hidden">
          <TopNav />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-[#0b0c10] scrollbar-thin scrollbar-thumb-gray-800 relative flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
