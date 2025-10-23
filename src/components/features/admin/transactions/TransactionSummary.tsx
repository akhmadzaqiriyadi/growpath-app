'use client';

// 1. Definisikan tipe untuk props yang akan diterima komponen ini
type TransactionSummaryProps = {
  totalAmount: number;
  transactionCount: number;
}

// 2. Terima props tersebut sebagai argumen fungsi dengan destructuring
export default function TransactionSummary({ totalAmount, transactionCount }: TransactionSummaryProps) {
  
  // Fungsi helper bisa tetap di sini atau dipindahkan ke file terpisah
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mt-6 p-4 border rounded-lg flex justify-between items-center font-semibold bg-gray-50">
      {/* 3. Gunakan props yang sudah diterima */}
      <span>Total ({transactionCount} transaksi ditampilkan):</span>
      <span className={`text-xl ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(totalAmount)}
      </span>
    </div>
  );
}