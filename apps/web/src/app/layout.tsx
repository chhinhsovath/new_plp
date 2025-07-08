import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Primary Learning Platform",
  description: "Interactive educational platform for primary school students in Cambodia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="km" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}