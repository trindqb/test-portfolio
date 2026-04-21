import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career Journey — Interactive Timeline Portfolio',
  description: 'Drive through my career journey in this interactive 2D car timeline portfolio experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}