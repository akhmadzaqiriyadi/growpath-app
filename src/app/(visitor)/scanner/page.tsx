"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from '@yudiel/react-qr-scanner';

// --- HELPER ICONS ---
// Anda dapat mengganti ini dengan library ikon seperti lucide-react atau react-icons
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 inline-block mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.218A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.218A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 inline-block mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const Loader = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
// --- END HELPER ICONS ---

const REDIRECT_URL = "https://utygrowpath.site";

export default function QRScannerPage() {
  const [data, setData] = useState("Tekan tombol untuk mulai scan QR Code");
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // record and redirect
  const recordAndRedirect = async (qrData: string) => {
    setIsProcessing(true);
    setIsScanning(false);
    setData("Mencatat kunjungan ke server...");

    try {
      const response = await fetch("/api/record-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code_data: qrData }),
      });

      if (response.ok) {
        setData("Pencatatan Berhasil! Mengarahkan...");
        window.location.href = REDIRECT_URL;
      } else {
        console.error("Gagal mencatat di API. Status:", response.status);
        setData(`Gagal mencatat: ${response.status}. Mengarahkan...`);
        setTimeout(() => (window.location.href = REDIRECT_URL), 1200);
      }
    } catch (e) {
      console.error("Fetch API error:", e);
      setData("Error koneksi API. Mengarahkan...");
      setTimeout(() => (window.location.href = REDIRECT_URL), 1200);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler saat QR berhasil di-scan
  const handleScan = (result: any) => {
    if (result && !isProcessing) {
      const qrText = result[0]?.rawValue || result;
      console.log("QR Code detected:", qrText);
      setData("✅ QR Ditemukan! Memproses...");
      recordAndRedirect(qrText);
    }
  };

  // Handler error
  const handleError = (error: any) => {
    console.error("Scanner error:", error);
    if (error?.name === 'NotAllowedError') {
      setError("Izin kamera ditolak. Silakan izinkan akses kamera.");
      setIsScanning(false);
    }
  };

  // Start scanning
  const handleStartScan = () => {
    setIsScanning(true);
    setError(null);
    setData("Scanner aktif. Arahkan kamera ke QR Code.");
  };

  // Stop scanning
  const handleStopScan = () => {
    setIsScanning(false);
    setData("Scanner dihentikan. Tekan tombol untuk mulai lagi.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 text-gray-800 p-4">
      <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
        Registrasi Visitor
      </h1>

      {/* Scanner Container */}
      <div
        style={{ width: "100%", maxWidth: "450px" }}
        className="rounded-xl shadow-2xl overflow-hidden bg-white p-4 transform transition-all duration-500 border border-amber-200"
      >
        {isScanning ? (
          <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment',
                aspectRatio: 1
              }}
              components={{
                finder: true
              }}
              styles={{
                container: {
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                },
                video: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                },
                finderBorder: 50
              }}
            />
          </div>
        ) : (
          <div className={`p-12 text-center flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 ${
            isProcessing ? "bg-amber-100 text-amber-800" : "bg-white text-gray-500"
          }`}>
            {isProcessing ? (
              <>
                <Loader />
                <p className="mt-4 font-semibold text-lg">{data}</p>
              </>
            ) : (
              <p className="font-medium text-lg text-gray-500">
                <CameraIcon /> {data}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 w-full max-w-sm space-y-3">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-red-800 mb-2">⚠️ {error}</h3>
            <p className="text-sm text-red-700 mb-3">
              Silakan izinkan akses kamera di pengaturan browser dan muat ulang halaman.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Muat Ulang Halaman
            </button>
          </div>
        )}

        {/* Start/Stop Scanner Button */}
        {!isScanning && !isProcessing && (
          <button
            onClick={handleStartScan}
            className="flex items-center justify-center w-full bg-amber-500 text-white p-4 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-amber-500/50 hover:bg-amber-600 transition duration-300 transform hover:scale-[1.02]"
          >
            <CameraIcon /> Mulai Pindai QR Code
          </button>
        )}

        {isScanning && !isProcessing && (
          <button
            onClick={handleStopScan}
            className="flex items-center justify-center w-full bg-red-500 text-white p-4 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-red-500/50 hover:bg-red-600 transition duration-300 transform hover:scale-[1.02]"
          >
            ⏹ Stop Scanner
          </button>
        )}
      </div>

      {/* Status Bar */}
      <div className={`mt-6 p-3 rounded-xl w-full max-w-lg text-center font-bold transition-all duration-500 ${
        error ? "bg-red-600 text-white shadow-lg shadow-red-500/50" :
        isProcessing ? "bg-green-600 text-white shadow-lg shadow-green-500/50" :
        "bg-amber-400 text-gray-800 shadow-lg shadow-amber-400/50"
      }`}>
        {data}
      </div>
    </div>
  );
}
