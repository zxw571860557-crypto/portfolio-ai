'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `transition-colors duration-200 ${
      pathname === path
        ? 'text-indigo-600 font-medium'
        : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/logo.png"
            alt="Portfolio AI"
            className="h-9 md:h-11 w-auto object-contain"
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className={linkClass('/')}>
            首页
          </Link>
          <Link href="/form" className={linkClass('/form')}>
            开始创作
          </Link>
        </nav>
      </div>
    </header>
  );
}
