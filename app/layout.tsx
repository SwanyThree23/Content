import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AI Soap Opera Studio — Domino Entertainment',
  description: 'Create, generate & publish automated soap operas with AI. Live studio, direct payments, professional broadcasting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
