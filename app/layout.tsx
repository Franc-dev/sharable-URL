import type { Metadata } from "next";
import { Syne } from 'next/font/google'
import { Comfortaa } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster"
const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
})
const comfortaa = Comfortaa({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comfortaa',
})

export const metadata: Metadata = {
  title: "shareable URL",
  description: "shareable URL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${syne.variable} ${comfortaa.variable} antialiased`}
      >
         <AuthProvider>
         <main>{children}</main>
         <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
