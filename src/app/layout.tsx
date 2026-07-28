import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServiaAI",
  description: "AI-powered hotel recruitment platform by Sorora Tech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
