import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/StoreContext';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portfolio AI - 智能作品集生成',
  description: '用 AI 生成你的第一份求职作品集，面向大学生的智能作品集生成工具。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <StoreProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
