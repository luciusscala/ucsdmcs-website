import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UC San Diego Men's Club Soccer",
    template: "%s | UC San Diego Men's Club Soccer",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
