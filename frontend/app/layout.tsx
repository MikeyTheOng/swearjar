import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google"

import { SessionProvider } from 'next-auth/react';

import { cn } from "@/lib/utils"
import { auth } from '@/auth';

import Footer from "@/components/layout/footer"
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <html lang="en" className={cn(poppins.className, "bg-background")}>
      <body
        className={cn("h-screen w-screen bg-background font-sans antialiased relative")}
      >
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="bottom-center"
            containerStyle={{
              backgroundColor: "transparent",
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
