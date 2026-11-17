import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { FooterGate } from '@/components/common/FooterGate';
import { AIAssistantBubble } from '@/components/common/AIAssistantBubble';
import './globals.css';

export const metadata: Metadata = {
  title: 'AD Computer - Service Komputer & IT Services',
  description: 'AD Computer — Sistem Layanan Service Komputer, Install OS, Networking & Maintenance IT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased text-gray-900 bg-white flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-white">{children}</main>
        <FooterGate />
        <AIAssistantBubble />
      </body>
    </html>
  );
}
