import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Styles (CSS custom properties, .glass-card, .btn, .form-input, .badge, ...)
// used by the auth/RBAC pages (Login, Register, Profile, UsersList, ...) -
// originally loaded via the now-unused Vite entry (main.tsx/App.tsx).
import "../index.css";
import { AuthHydrator } from "@/components/AuthHydrator";

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
        {/* Restores the auth session (if any) on every page, including
            /login itself, before ProtectedRoute (in the (dashboard) route
            group layout) decides whether to redirect. */}
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
