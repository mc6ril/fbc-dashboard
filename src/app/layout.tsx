import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";
import AuthStateChangeProvider from "@/presentation/providers/AuthStateChangeProvider";
import GlobalLoaderProvider from "@/presentation/providers/GlobalLoaderProvider";
import I18nProvider from "@/presentation/providers/I18nProvider";
import { defaultLocale } from "@/shared/i18n/config";

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
  // Use default locale for lang attribute
  // When multi-locale support is added, this can be made dynamic
  // by using getLocale() from next-intl/server or reading from request headers
  const locale = defaultLocale;

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <I18nProvider>
          <ReactQueryProvider>
            <AuthStateChangeProvider>
              <GlobalLoaderProvider>{children}</GlobalLoaderProvider>
            </AuthStateChangeProvider>
          </ReactQueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
