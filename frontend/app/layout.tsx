import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google"

import Providers from './providers'
import { SessionProvider } from 'next-auth/react';

import { cn } from "@/lib/utils"
import { auth } from '@/auth';

import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwearJar",
  description: "Jar Your Habits",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <html lang="en" className={cn(poppins.className, "bg-background-100")}>
      <head>
        <title>SwearJar</title>
        <meta name="description" content="Jar Your Habits" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://swearjar.michaelongning.com" />
        <meta property="og:title" content="SwearJar" />
        <meta property="og:description" content="Jar Your Habits" />
        <meta property="og:image" content="https://swearjar.michaelongning.com/default-image.jpg" />
      </head>
      <body
        className={cn("bg-background-100 font-sans antialiased relative selection:bg-secondary selection:text-white")}
      >
        <Providers>
          <SessionProvider session={session}>
            {/* <nav className="bg-red-500 w-full h-12"></nav> */}
            <main>
              {children}
            </main>
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
