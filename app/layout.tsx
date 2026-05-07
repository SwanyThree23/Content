import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import dynamic from 'next/dynamic';

const QuickNav = dynamic(() => import('@/components/ui/QuickNav').then((m) => m.QuickNav), { ssr: false });

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
        <Providers>
          {children}
          <QuickNav />
        </Providers>
      </body>
    </html>
  );
}
