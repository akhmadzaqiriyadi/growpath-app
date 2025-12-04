'use client';

import { useState, useRef } from 'react';
import { QrCode, Download, Share2, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

export default function QRGeneratorClient() {
  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = async () => {
    // Generate QR URL - PRODUCTION URL untuk global event visitor
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cashflow.utygrowpath.site';
    const url = `${baseUrl}/visit/event`; // Global event URL, no tenant ID
    setQrUrl(url);

    // Generate QR Code
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
      setGenerated(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-uty-growpath-event.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UTY GrowPath Event',
          text: 'Scan QR atau klik link untuk mencatat kehadiran Anda di event',
          url: qrUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              QR Code Absensi Event
            </h1>
            <p className="text-sm text-gray-600">
              Generate QR code untuk absensi pengunjung event UTY GrowPath
            </p>
          </div>

          {!generated ? (
            // Generate Button
            <div className="text-center py-12">
              <Button
                onClick={handleGenerate}
                size="lg"
                className="px-8"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Generate QR Code Event
              </Button>
            </div>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
                <div className="bg-white rounded-lg p-8 shadow-md mx-auto max-w-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Event"
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  )}
                </div>
                <p className="text-center text-xs text-gray-500 mt-4 font-mono break-all px-4">
                  {qrUrl}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleDownload}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download QR Code
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    size="lg"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>

                <Button
                  onClick={() => setGenerated(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Generate Ulang
                </Button>
              </div>

              {/* Instructions */}
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-blue-900 mb-2">
                  📱 Cara Penggunaan:
                </h3>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download QR code dan cetak atau tampilkan di layar</li>
                  <li>Tempelkan di area event yang mudah diakses pengunjung</li>
                  <li>Pengunjung scan QR = otomatis tercatat sebagai visitor</li>
                  <li>Tidak perlu buka aplikasi scanner lagi!</li>
                  <li>Data visitor bisa dilihat di menu "Visitors"</li>
                </ol>
              </div>

              {/* Stats Info */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 text-center">
                  <strong>Catatan:</strong> QR ini untuk absensi global event UTY GrowPath.
                  Semua pengunjung yang scan akan tercatat sebagai visitor event.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
