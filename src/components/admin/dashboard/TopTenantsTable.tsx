import { Trophy } from 'lucide-react';

type TenantData = {
  tenant_id: string | null;
  tenant_name: string | null;
  npm: string | null;
  prodi: string | null;
  business_category: string | null;
  total_transactions: number | null;
  total_income: number | null;
  total_expense: number | null;
  net_revenue: number | null;
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function TopTenantsTable({ data }: { data: TenantData[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-lg text-gray-800">Top Tenant (Revenue)</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pl-2">Tenant</th>
              <th className="pb-3">Kategori</th>
              <th className="pb-3 text-right">Transaksi</th>
              <th className="pb-3 text-right pr-2">Net Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((tenant, index) => (
              <tr key={tenant.tenant_id || index} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-gray-100 text-gray-700' : 
                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{tenant.tenant_name}</p>
                      <p className="text-xs text-gray-500">{tenant.prodi}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {tenant.business_category}
                  </span>
                </td>
                <td className="py-3 text-right text-sm text-gray-600">
                  {tenant.total_transactions}
                </td>
                <td className="py-3 text-right pr-2">
                  <span className="font-medium text-sm text-green-600">
                    {formatRupiah(tenant.net_revenue || 0)}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                  Belum ada data tenant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
