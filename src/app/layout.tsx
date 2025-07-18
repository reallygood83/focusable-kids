import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Header } from '@/components/layout/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '집중력 강화 게임 - ADHD 아동을 위한 인지 훈련 플랫폼',
  description: '초등학생을 위한 ADHD 조기 선별 및 집중력 향상 게임 플랫폼. 재미있는 미니게임으로 주의력과 충동성을 개선해보세요.',
  keywords: 'ADHD, 집중력, 초등학생, 인지훈련, 주의력결핍, 게임',
  openGraph: {
    title: '집중력 강화 게임',
    description: 'ADHD 아동을 위한 인지 훈련 플랫폼',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
