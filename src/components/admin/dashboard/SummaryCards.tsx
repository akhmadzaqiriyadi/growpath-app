import { ArrowUpRight, ArrowDownRight, Users, ShoppingBag, Activity, Wallet } from 'lucide-react';

type SummaryData = {
  totalIncome: number;
  totalExpense: number;
  netRevenue: number;
  totalTransactions: number;
  activeTenants: number;
  totalVisitors: number;
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function SummaryCards({ data }: { data: SummaryData }) {
  const cards = [
    {
      title: 'Total Pendapatan Bersih',
      value: formatRupiah(data.netRevenue),
      icon: Wallet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12.5%', // Placeholder trend
      trendUp: true,
    },
    {
      title: 'Pemasukan',
      value: formatRupiah(data.totalIncome),
      icon: ArrowUpRight,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Pengeluaran',
      value: formatRupiah(data.totalExpense),
      icon: ArrowDownRight,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: '-2.4%',
      trendUp: false, // Good thing if expenses go down? Or just direction? Let's assume direction.
    },
    {
      title: 'Total Transaksi',
      value: data.totalTransactions.toLocaleString('id-ID'),
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+5.1%',
      trendUp: true,
    },
    {
      title: 'Tenant Aktif',
      value: data.activeTenants.toString(),
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      trend: 'Stable',
      trendUp: true,
    },
    {
      title: 'Total Pengunjung',
      value: data.totalVisitors.toLocaleString('id-ID'),
      icon: Activity,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      trend: '+18.2%',
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            {/* Placeholder for trend badge */}
            {/* <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {card.trend}
            </span> */}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
