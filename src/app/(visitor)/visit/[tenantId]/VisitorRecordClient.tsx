'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Ticket } from 'lucide-react';

export default function VisitorRecordClient() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Mencatat kunjungan Anda...');

  useEffect(() => {
    recordVisit();
  }, []);

  const recordVisit = async () => {
    try {
      const response = await fetch('/api/record-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: null }), // Global visitor, no specific tenant
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Kunjungan Anda berhasil dicatat!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Gagal mencatat kunjungan');
      }
    } catch (error) {
      console.error('Error recording visit:', error);
      setStatus('error');
      setMessage('Terjadi kesalahan jaringan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Event Info */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            UTY GrowPath Event
          </h1>
          <p className="text-sm text-gray-500">
            Selamat datang di event kami!
          </p>
        </div>

        {/* Status */}
        <div className="py-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-gray-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 mb-2">{message}</p>
                <p className="text-sm text-gray-500">
                  Terima kasih telah hadir di event UTY GrowPath
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-600 mb-2">{message}</p>
                <p className="text-sm text-gray-500">Silakan hubungi panitia</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by UTY GrowPath • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
