import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";
import AuthFromUrl from "@/components/AuthFromUrl";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "FreeWeight - Stress Less. Lift More.",
  description: "Program your training, track your progress, and train with your team — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <AuthFromUrl />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
