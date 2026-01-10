import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Soap Opera Studio - Automated Content Creation',
  description: 'Create, generate & publish automated soap operas with AI. Professional AI-powered content studio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
