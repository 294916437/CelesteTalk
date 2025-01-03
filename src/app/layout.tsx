import type { Metadata } from "next";
import "@/styles/global.css";
import { ThemeProvider } from "@/utils/providers/theme-provider";
import ToastContainerBar from "@/components/ToastContainerBar";
import { QueryProvider } from "@/utils/providers/query-provider";

export const metadata: Metadata = {
  title: "CelesteTalk",
  description: "Open your minds and talk everything with CelesteTalk",
  openGraph: {
    images: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <body className='min-h-screen bg-background antialiased'>
        <ThemeProvider defaultTheme='system'>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <ToastContainerBar />
      </body>
    </html>
  );
}
