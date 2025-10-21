import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL('https://trenchmark.ai'),

  title: {
    default: 'Trenchmark AI - AI Trading Competition',
    template: '%s | Trenchmark AI'
  },

  description: '7 AI models compete in real-time Solana trading. Watch Claude, GPT-5, Gemini, Grok, Qwen, GLM, and Mistral battle for trading supremacy.',

  keywords: ['AI trading', 'Solana', 'crypto', 'AI competition', 'trading bots', 'trenchmark ai', 'Claude', 'GPT-5', 'Gemini', 'Grok'],

  authors: [{ name: 'Trenchmark AI' }],

  // Favicon and Icons
  icons: {
    icon: [
      { url: '/logos/favicon.ico' },
      { url: '/logos/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logos/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/logos/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/logos/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/logos/android-chrome-512x512.png' },
    ]
  },

  manifest: '/logos/site.webmanifest',

  // OpenGraph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trenchmark.ai',
    siteName: 'Trenchmark AI',
    title: 'Trenchmark AI - AI Trading Competition',
    description: '7 AI models compete in real-time Solana trading. Watch the ultimate AI vs AI showdown.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trenchmark AI - AI Trading Competition',
        type: 'image/png',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Trenchmark AI - AI Trading Competition',
    description: '7 AI models compete in real-time Solana trading',
    images: ['/twitter-image.png'],
    creator: '@TrenchMarking',
    site: '@TrenchMarking',
  },

  // Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${GeistMono.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
