import { Suspense } from "react";
import ActivityFeed from "./ActivityFeed";
import SummaryCards from "@/components/admin/dashboard/SummaryCards";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopTenantsTable from "@/components/admin/dashboard/TopTenantsTable";
import CategoryPieChart from "@/components/admin/dashboard/CategoryPieChart";
import { 
  getDashboardSummary, 
  getRevenueChartData, 
  getTopTenants, 
  getCategoryDistribution 
} from "@/lib/actions/dashboard";

export default async function Dashboard() {
  // Fetch all data in parallel
  const [
    summaryRes,
    revenueRes,
    topTenantsRes,
    categoryRes
  ] = await Promise.all([
    getDashboardSummary(),
    getRevenueChartData(),
    getTopTenants(5),
    getCategoryDistribution()
  ]);

  // Handle errors gracefully (in a real app, maybe show error toasts or fallback UI)
  const summaryData = summaryRes.data || {
    totalIncome: 0,
    totalExpense: 0,
    netRevenue: 0,
    totalTransactions: 0,
    activeTenants: 0,
    totalVisitors: 0
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan performa dan aktivitas terkini UTY GrowPath.
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* 1. Summary Cards */}
      <SummaryCards data={summaryData} />

      {/* 2. Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueRes.data || []} />
        </div>
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<div className="h-[400px] bg-white rounded-xl animate-pulse" />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>

      {/* 3. Secondary Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopTenantsTable data={topTenantsRes.data || []} />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart data={categoryRes.data || []} />
        </div>
      </div>
    </div>
  );
}
