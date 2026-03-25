import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suriname Time Machine - Plantation Viewer',
  description:
    'Explore historical plantations of Suriname with linked open data',
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
