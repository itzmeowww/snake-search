import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ヘビゲームと探索アルゴリズム",
  description: "ヘビゲームで探索アルゴリズムを比較してみよう",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
       
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster />
      </body>

    </html>
  );
}


const locales = ['en', 'ja'];

// export function generateStaticParams() {
//   return locales.map((locale) => ({ locale }));
// }