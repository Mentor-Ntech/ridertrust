import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/components/Web3Provider";
import "@rainbow-me/rainbowkit/styles.css";
import { ToastProvider } from "@/components/ToastProvider";
import UserLoginBar from "@/components/UserLoginBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RiderTrust - Local Delivery DApp",
  description: "Secure, transparent local deliveries powered by blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}>
        <ToastProvider>
          <Web3Provider>
            <div className="max-w-4xl mx-auto">
              <UserLoginBar />
              {children}
            </div>
          </Web3Provider>
        </ToastProvider>
      </body>
    </html>
  );
}
