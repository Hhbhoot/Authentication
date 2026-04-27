import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'AuthSystem | Premium Authentication',
  description: 'Production-ready authentication system built with Next.js and MongoDB',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="pt-16 pb-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
