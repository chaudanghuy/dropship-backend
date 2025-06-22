import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from '@/contexts/AuthContext'

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS System - Point of Sale Management",
  description: "Full-featured customizable POS system for retail management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </AuthProvider>
      </body>
    </html>
  );
}
