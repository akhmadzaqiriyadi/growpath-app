"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";

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
const QR_SCANNER_ID = "qr-code-full-region";

export default function QRScannerPage() {
  const [data, setData] = useState(
    "Arahkan kamera ke QR Code atau unggah gambar"
  );
  const [error, setError] = useState<string | null>(null);
  const [isScannerInitialized, setIsScannerInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // Diatur false, menunggu tombol ditekan
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const router = useRouter();

  // record and redirect (centralized)
  const recordAndRedirect = async (qrData: string) => {
    // block further scans immediately
    setIsScanning(false);
    setIsImageProcessing(true);
    setData("Mencatat kunjungan ke server...");

    // try to clear scanner UI if exists
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.warn("Gagal clear scanner (tidak kritis):", e);
      }
      scannerRef.current = null;
      setIsScannerInitialized(false); // Reset status inisialisasi
    }

    try {
      const response = await fetch("/api/record-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code_data: qrData }),
      });

      if (response.ok) {
        // sukses -> redirect
        setData("Pencatatan Berhasil! Mengarahkan...");
        window.location.href = REDIRECT_URL;
      } else {
        console.error("Gagal mencatat di API. Status:", response.status);
        setData(`Gagal mencatat: ${response.status}. Mengarahkan...`);
        // tetap redirect sesuai logika awal
        setTimeout(() => (window.location.href = REDIRECT_URL), 1200);
      }
    } catch (e) {
      console.error("Fetch API error:", e);
      setData("Error koneksi API. Mengarahkan...");
      setTimeout(() => (window.location.href = REDIRECT_URL), 1200);
    } finally {
      setIsImageProcessing(false);
    }
  };

  // dipanggil saat kamera berhasil decode
  const onScanSuccess = (decodedText: string) => {
    // hindari pemanggilan berulang
    if (!isScanning) return;
    setIsScanning(false);
    setData("✅ QR Ditemukan! Memproses...");
    recordAndRedirect(decodedText);
  };

  const onScanError = (_errorMessage: string) => {
    // non-fatal scan errors — diabaikan
  };

  // Fungsi untuk Inisialisasi/Start Scanner (Dipanggil oleh Tombol)
  const initScanner = async () => {
    if (scannerRef.current) return;

    setIsScanning(true);
    setError(null);
    setData("Meminta izin kamera...");

    try {
      const scanner = new Html5QrcodeScanner(
        QR_SCANNER_ID,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          disableFlip: false,
        },
        false
      );

      scannerRef.current = scanner;
      setIsScannerInitialized(true);

      // Panggilan render() memicu permintaan izin kamera
      scanner.render(onScanSuccess, onScanError);
    } catch (err) {
      console.error("Error inisialisasi scanner:", err);
      setError(
        "Gagal menginisialisasi kamera. Pastikan izin kamera diberikan."
      );
      setIsScanning(false);
      setIsScannerInitialized(false);
    }
  };

  // useEffect sekarang hanya untuk cleanup saat unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((e) => console.warn("Error saat clear scanner di cleanup:", e))
          .finally(() => {
            scannerRef.current = null;
            setIsScannerInitialized(false);
            setIsScanning(false);
          });
      }
    };
  }, []);

  // Fungsi yang dipanggil oleh tombol "Mulai Pindai"
  const handleStartScan = () => {
    initScanner();
  };

  // handler upload gambar
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsImageProcessing(true);
    setIsScanning(false);
    setData("Memproses gambar...");

    // clear camera scanner jika aktif
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.warn("Error menghentikan scanner saat upload:", e);
      } finally {
        scannerRef.current = null;
        setIsScannerInitialized(false);
      }
    }

    // gunakan Html5Qrcode untuk scan dari file
    const html5QrCode = new Html5Qrcode(QR_SCANNER_ID);

    try {
      const decodedText = await html5QrCode.scanFile(
        file,
        /* showImage= */ false
      );
      setData("✅ QR Ditemukan dari gambar: " + decodedText);
      await recordAndRedirect(decodedText);
    } catch (err) {
      console.error("Gagal memindai gambar:", err);
      setData("Gagal memindai gambar QR. Coba lagi.");
      setIsImageProcessing(false);
      scannerRef.current = null;
      setTimeout(() => setIsScannerInitialized(false), 300);
    } finally {
      // kosongkan input agar file yang sama bisa diunggah lagi
      event.target.value = "";
      try {
        await html5QrCode.clear();
      } catch {
        // ignore
      }
    }
  };

  const getStatusClassesModified = () => {
    if (error) return "bg-red-600 text-white shadow-lg shadow-red-500/50"; // Error tetap merah
    if (
      isImageProcessing ||
      (!isScanning && !error && data.includes("Pencatatan Berhasil"))
    )
      return "bg-green-600 text-white shadow-lg shadow-green-500/50"; // Sukses tetap hijau, atau Anda bisa ganti ke gold-ish juga
    return "bg-amber-400 text-gray-800 shadow-lg shadow-amber-400/50"; // Status default kuning muda
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 text-gray-800 p-4">
      {" "}
      {/* Mengubah text-white menjadi text-gray-800 untuk kontras */}
      <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
        {" "}
        {/* Gradient kuning-orange */}
        Registrasi Visitor
      </h1>
      <div
        style={{ width: "100%", maxWidth: "450px" }}
        className="rounded-xl shadow-2xl overflow-hidden bg-white p-2 transform transition-all duration-500 border border-amber-200" // Background putih, border tipis
      >
        <div
          id={QR_SCANNER_ID}
          className={`${
            isScanning && isScannerInitialized && !isImageProcessing
              ? ""
              : "hidden"
          }`}
        >
          {/* Scanner akan di-inject ke div ini */}
        </div>

        {/* Placeholder utama saat kamera nonaktif atau memproses */}
        {(!isScanning || !isScannerInitialized || isImageProcessing) && (
          <div
            className={`p-12 text-center flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 ${
              isImageProcessing
                ? "bg-amber-100 text-amber-800"
                : "bg-white text-gray-500" // Nuansa kuning muda untuk loading, putih untuk idle
            }`}
          >
            {isImageProcessing ? (
              <>
                <Loader color="text-amber-800" />{" "}
                {/* Menambahkan prop color ke Loader jika Anda ingin mengubah warna spin-nya */}
                <p className="mt-4 font-semibold text-lg">{data}</p>
              </>
            ) : (
              <p className="font-medium text-lg text-gray-500">
                <CameraIcon color="text-gray-500" /> Kamera menunggu aktivasi.
              </p>
            )}
          </div>
        )}
      </div>
      {/* Bagian Tombol Aksi */}
      <div className="mt-8 w-full max-w-sm space-y-3">
        {/* Tombol Mulai Pindai (Tombol Utama untuk meminta izin/start scan) */}
        {!isScanning && !isImageProcessing && (
          <button
            onClick={handleStartScan}
            // Gaya tombol utama yang menarik
            className="flex items-center justify-center w-full bg-amber-500 text-white p-4 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-amber-500/50 hover:bg-amber-600 transition duration-300 transform hover:scale-[1.02]" // Warna amber
          >
            <CameraIcon /> Mulai Pindai QR Code
          </button>
        )}

        {/* Tombol Unggah File QR Code */}
        <label
          htmlFor="qr-upload"
          className={`flex items-center justify-center w-full p-3 rounded-full font-semibold cursor-pointer transition duration-300 
        ${
          isImageProcessing
            ? "bg-gray-300 text-gray-600 cursor-not-allowed" // Warna abu-abu untuk disabled
            : "bg-amber-500 text-white shadow-lg shadow-yellow-600/50 hover:bg-yellow-700" // Warna kuning/gold
        }`}
        >
          {isImageProcessing ? (
            <>
              <Loader /> Sedang Memproses...
            </>
          ) : (
            <>
              <UploadIcon /> Unggah File QR Code
            </>
          )}
        </label>
        <input
          id="qr-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isImageProcessing}
          className="hidden"
        />
      </div>
      {/* Status Bar Dinamis */}
      <div
        className={`mt-6 p-3 rounded-xl w-full max-w-lg text-center font-bold transition-all duration-500 ${getStatusClassesModified()}`}
      >
        {data}
      </div>
      {error && <p className="text-red-600 mt-4 text-sm">Error: {error}</p>}{" "}
      {/* Error tetap merah agar jelas */}
    </div>
  );
}
