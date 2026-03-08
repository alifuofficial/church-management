import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Church | Experience Faith Without Boundaries",
  description: "Join our global community for transformative worship, powerful messages, and meaningful connections. Your journey to spiritual growth starts here.",
  keywords: ["Church", "Worship", "Faith", "Community", "Sermons", "Events", "Prayer", "Digital Church", "Online Church", "Live Streaming"],
  authors: [{ name: "Digital Church Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Digital Church | Experience Faith Without Boundaries",
    description: "Join our global community for transformative worship, powerful messages, and meaningful connections.",
    type: "website",
    images: ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Church | Experience Faith Without Boundaries",
    description: "Join our global community for transformative worship, powerful messages, and meaningful connections.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
