import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";
import AuthStateChangeProvider from "@/presentation/providers/AuthStateChangeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atelier FBC",
  description: "Atelier FBC: dashboard de suivit d'activités",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <AuthStateChangeProvider>{children}</AuthStateChangeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
