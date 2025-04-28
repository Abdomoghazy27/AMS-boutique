import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context'; // Import CartProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AMS Boutique',
  description: 'Your destination for modern fashion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider> {/* Wrap with CartProvider */}
          <Header />
          <main className="flex-1 pt-4 pb-16">{children}</main> {/* Add padding bottom */}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
