'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Package, FileText, User } from 'lucide-react';

interface TenantMobileLayoutProps {
  children: React.ReactNode;
}

export function TenantMobileLayout({ children }: TenantMobileLayoutProps) {
  const pathname = usePathname();
  
  // Don't show layout on login page
  const isLoginPage = pathname === '/login';
  
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navigation = [
    { name: 'Beranda', href: '/dashboard', icon: Home },
    { name: 'Produk', href: '/products', icon: Package },
    { name: 'Transaksi', href: '/transactions', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-bold text-gray-900">Growpath</h1>
              <p className="text-xs text-gray-500">Cashflow App</p>
            </div>
          </div>
          {/* Logo */}
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="Growpath Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </header>

      {/* Main Content - dengan padding bottom untuk navbar */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center py-2 px-3
                    transition-colors duration-200
                    ${active 
                      ? 'text-primary' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-6 w-6 mb-1 ${active ? 'stroke-2' : ''}`} />
                  <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
