import Link from 'next/link';
import { getRecentActivity } from '@/lib/actions/dashboard'; // Sesuaikan path import Anda

type ActivityItem = {
  activity_type: string;
  created_at: string;
  title: string;
  subtitle: string | null;
  amount: number | null;
  status: string;
  link_id: string;
};

// Helper sederhana untuk format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper sederhana untuk waktu relatif (Contoh: "2 jam yang lalu")
// Anda bisa ganti pakai library 'date-fns' atau 'dayjs' jika mau lebih robust
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
};

export default async function ActivityFeed() {
  // 1. Ambil data langsung di server component
  const { data } = await getRecentActivity(5);
  // Kita beri tahu TS: "Percayalah, data ini adalah kumpulan ActivityItem"
  const activities = data as ActivityItem[];

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Aktivitas Terbaru</h3>
        <p className="text-gray-500 text-sm">Belum ada aktivitas tercatat.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-gray-800">Aktivitas Terbaru</h3>
        {/* Opsional: Link ke halaman log lengkap */}
        {/* <Link href="/analytics" className="text-sm text-orange-500 hover:underline">Lihat Semua</Link> */}
      </div>

      <div className="space-y-6">
        {activities.map((item, index) => (
          <div key={index} className="flex gap-4 items-start">
            {/* --- Bagian IKON --- */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
              ${
                item.activity_type === 'NEW_TENANT'
                  ? 'bg-blue-100 text-blue-600'
                  : item.status === 'PEMASUKAN'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {/* Anda bisa ganti ini dengan Icon Library (Lucide/Heroicons) */}
              {item.activity_type === 'NEW_TENANT' ? (
                <span className="font-bold text-lg">👤</span>
              ) : item.status === 'PEMASUKAN' ? (
                <span className="font-bold text-lg">↗</span>
              ) : (
                <span className="font-bold text-lg">↘</span>
              )}
            </div>

            {/* --- Bagian KONTEN --- */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.title}
                </p>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatTimeAgo(item.created_at)}
                </span>
              </div>

              <p className="text-xs text-gray-500 truncate">
                {item.activity_type === 'NEW_TENANT'
                  ? 'Tenant baru bergabung'
                  : item.subtitle || 'Tidak ada catatan'}
              </p>

              {/* Tampilkan Nominal hanya jika Transaksi */}
              {item.activity_type === 'TRANSACTION' && item.amount !== null && (
                <p
                  className={`text-xs font-medium mt-1 ${
                    item.status === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.status === 'PEMASUKAN' ? '+ ' : '- '}
                  {formatRupiah(item.amount)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}