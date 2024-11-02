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
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://swearjar.ongspace.com'
      : 'http://localhost:3000'
  ),
  title: "SwearJar",
  description: "Jar Your Habits",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: 'https://swearjar.ongspace.com',
    title: "SwearJar",
    description: "Jar Your Habits",
    images: [
      {
        url: "https://swearjar.ongspace.com/opengraph-image.png",
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    title: "SwearJar",
    description: "Jar Your Habits",
    images: [
      { url: "https://swearjar.ongspace.com/opengraph-image.png", width: 1200, height: 630 },
    ],
  },
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
        className={cn("bg-background-100 font-sans antialiased relative selection:bg-secondary selection:text-white")}
      >
        <Providers>
          <SessionProvider session={session}>
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
