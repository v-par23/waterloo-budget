import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { AuthProvider } from "@/components/AuthProvider";
import { SavedSpotsProvider } from "@/components/SavedSpotsProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaterlooBudget - Budget Guide to Waterloo",
  description: "A curated guide to budget-friendly spots in Waterloo, Ontario for students, founders, and tech workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-gray-50">
        <AuthProvider>
          <SavedSpotsProvider>
            <Sidebar />
            <MobileHeader />
            <main className="lg:pl-64 pt-14 lg:pt-0">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                {children}
              </div>
            </main>
          </SavedSpotsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
