import type { Metadata } from "next";
import "@/styles/global.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "CelesteTalk",
  description: "Talk everything here and open your mind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='min-h-screen bg-background antialiased'>
        <ThemeProvider defaultTheme='system'>{children}</ThemeProvider>
      </body>
    </html>
  );
}
