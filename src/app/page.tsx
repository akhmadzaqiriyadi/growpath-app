'use client'; // <- wajib kalau pakai hooks di Next.js (seperti useRouter)

import React from 'react';
import { useRouter } from 'next/navigation';

// SVG Icon Components
const QrCode = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v4a1 1 0 0 1-1 1H7" />
    <path d="M12 12v3" />
    <path d="M16 12h-3a1 1 0 0 0-1 1v4" />
  </svg>
);

const LogIn = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

export default function Home() {
  const router = useRouter();

  const handleScannerClick = () => {
    console.log('Pindah ke halaman scanner');
    router.push('/scanner');
  };

  const handleLoginClick = () => {
    console.log('Pindah ke halaman login');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 antialiased text-gray-900 
                    bg-amber-50 font-sans relative overflow-hidden">
      <div className="max-w-4xl w-full z-10 text-center p-4">
        <div className="inline-flex items-center text-xs font-medium text-amber-800 
                        rounded-full mb-8 backdrop-blur-sm">
          <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl font-extrabold text-orange-800">GP</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
          Welcome to UtyGrowpath #3
        </h1>

        <p className="text-lg sm:text-xl text-orange-800 mb-12 max-w-2xl mx-auto">
          Pengunjung silahkan untuk Scanner Barcode yang sudah disediakan
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={handleScannerClick}
            className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-xl 
                        bg-orange-600 text-white shadow-lg shadow-orange-500/50 
                        transition-all duration-300 transform hover:scale-[1.05] hover:bg-orange-700 
                        focus:outline-none focus:ring-4 focus:ring-orange-500/50"
          >
            <QrCode className="w-6 h-6" />
            Scanner
          </button>

          <button
            onClick={handleLoginClick}
            className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-xl 
                        bg-transparent text-orange-700 border-2 border-orange-500 
                        transition-all duration-300 transform hover:scale-[1.05] hover:bg-orange-50 
                        focus:outline-none focus:ring-4 focus:ring-orange-300/50"
          >
            <LogIn className="w-6 h-6" />
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
