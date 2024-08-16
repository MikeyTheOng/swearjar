import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google"

import Providers from './providers'
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
    <html lang="en" className={cn(poppins.className, "bg-background-100")}>
      <body
        className={cn("bg-background-100 font-sans antialiased relative")}
      >
        <Providers>
          <SessionProvider session={session}>
            {/* <nav className="bg-red-500 w-full h-12"></nav> */}
            <main className="h-screen">
              {children}
            </main>
            <Footer />
            <Toaster
              position="bottom-center"
              containerStyle={{
                backgroundColor: "transparent",
              }}
            />
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
