// src/app/(admin)/visitors/VisitorsClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Scan,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart2,
} from 'lucide-react';
import {
  getVisitorOverview,
  getVisitorsByDay,
  type VisitorOverview,
  type VisitorsByDay,
} from '@/lib/actions/visitors'; 

export function VisitorsClient() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<VisitorOverview | null>(null);
  const [visitorsByDay, setVisitorsByDay] = useState<VisitorsByDay[]>([]);

  useEffect(() => {
    loadVisitorData();
  }, []);

  const loadVisitorData = async () => {
    setLoading(true);
    try {
      const [overviewData, visitorsData] = await Promise.all([
        getVisitorOverview(),
        getVisitorsByDay(7), // Last 7 days
      ]);

      setOverview(overviewData);
      setVisitorsByDay(visitorsData);
    } catch (error) {
      console.error('Failed to load visitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!overview) return null;

  // Calculate max visitors for chart scaling
  const maxVisitors = Math.max(...visitorsByDay.map(m => m.count));

  // Placeholder for simple comparison (e.g., comparing today vs. yesterday)
  const yesterdayVisitors = visitorsByDay.length >= 2 ? visitorsByDay[visitorsByDay.length - 2].count : 0;
  const todayVisitors = visitorsByDay.length >= 1 ? visitorsByDay[visitorsByDay.length - 1].count : 0;

  const visitorGrowth = yesterdayVisitors > 0 
    ? ((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100 
    : (todayVisitors > 0 ? 100 : 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Visitors */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="text-xs text-gray-600 mb-1">Total Visitor Scan</h3>
          <p className="text-lg font-bold text-gray-900">{formatNumber(overview.totalVisitors)}</p>
        </div>

        {/* Visitors Today */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scan className="h-5 w-5 text-blue-600" />
            </div>
            {yesterdayVisitors > 0 && (
              <span className={`flex items-center text-xs font-medium ${
                visitorGrowth > 0 ? 'text-green-600' : (visitorGrowth < 0 ? 'text-red-600' : 'text-gray-600')
              }`}>
                {visitorGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : (visitorGrowth < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null)}
                {Math.abs(visitorGrowth).toFixed(1)}% vs Kemarin
              </span>
            )}
          </div>
          <h3 className="text-xs text-gray-600 mb-1">Visitor Hari Ini</h3>
          <p className="text-lg font-bold text-gray-900">{formatNumber(overview.visitorsToday)}</p>
        </div>
      </div>

      {/* Visitors Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Visitor Trend (7 Hari Terakhir)
        </h3>
        <div className="space-y-4">
          {visitorsByDay.map((day, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className='h-4 w-4 text-gray-500' />
                    {day.label}
                </span>
                <span className="font-semibold text-gray-900">{day.count} kunjungan</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${maxVisitors > 0 ? (day.count / maxVisitors) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {maxVisitors === 0 && (
            <p className='text-center text-gray-500 mt-6'>Belum ada data kunjungan dalam 7 hari terakhir.</p>
        )}
      </div>

     
    </div>
  );
}