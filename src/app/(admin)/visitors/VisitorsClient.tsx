'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Scan, TrendingUp, TrendingDown, BarChart2, Clock, Calendar, Filter 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import {
  getVisitorOverview,
  getVisitorsByDay,
  getVisitorsByHour,
  type VisitorOverview,
  type VisitorsByDay,
} from '@/lib/actions/visitors'; 

// Tipe data untuk chart jam
type VisitorHourly = {
  hour_label: string;
  count: number;
};

export function VisitorsClient() {
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [overview, setOverview] = useState<VisitorOverview | null>(null);
  const [visitorsTwoDays, setVisitorsTwoDays] = useState<VisitorsByDay[]>([]);
  const [visitorsHourly, setVisitorsHourly] = useState<VisitorHourly[]>([]);

  // Filter State untuk Line Chart
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Hari ini
  const [startHour, setStartHour] = useState(8); // Default jam 8 pagi
  const [endHour, setEndHour] = useState(17); // Default jam 5 sore

  // --- Load Initial Data (Overview & Bar Chart) ---
  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const [overviewData, twoDaysData] = await Promise.all([
          getVisitorOverview(),
          getVisitorsByDay(2), // HANYA 2 HARI TERAKHIR
        ]);
        setOverview(overviewData);
        setVisitorsTwoDays(twoDaysData);
      } catch (error) {
        console.error('Failed load overview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  // --- Load Hourly Data (Line Chart) ---
  // Dijalankan setiap kali filter tanggal/jam berubah
  useEffect(() => {
    const loadHourly = async () => {
      if (startHour > endHour) return; // Validasi sederhana
      const data = await getVisitorsByHour(filterDate, startHour, endHour);
      setVisitorsHourly(data);
    };
    loadHourly();
  }, [filterDate, startHour, endHour]);

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-primary font-medium">
            {payload[0].value} Pengunjung
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading || !overview) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Hitung pertumbuhan (Growth) untuk Bar Chart 2 hari
  const yesterdayData = visitorsTwoDays.length > 0 ? visitorsTwoDays[0] : { count: 0 };
  const todayData = visitorsTwoDays.length > 1 ? visitorsTwoDays[1] : { count: 0 };
  
  const visitorGrowth = yesterdayData.count > 0 
    ? ((todayData.count - yesterdayData.count) / yesterdayData.count) * 100 
    : (todayData.count > 0 ? 100 : 0);

  return (
    <div className="space-y-8">
      
      {/* 1. OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Visitors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Visitor Scan</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalVisitors)}</p>
        </div>

        {/* Visitors Today vs Yesterday */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <Scan className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Visitor Hari Ini</h3>
            </div>
            <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              visitorGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {visitorGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(visitorGrowth).toFixed(1)}% vs Kemarin
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.visitorsToday)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. BAR CHART (2 HARI TERAKHIR) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Perbandingan 2 Hari
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitorsTwoDays} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                  {visitorsTwoDays.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === visitorsTwoDays.length - 1 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. LINE CHART (PER JAM) DENGAN FILTER */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          
          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Trafik Per Jam
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
                <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 text-sm p-1"
                />
              </div>
              
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border">
                <select 
                  value={startHour} 
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 text-sm p-1 cursor-pointer"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
                <span className="text-gray-400">-</span>
                <select 
                  value={endHour} 
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 text-sm p-1 cursor-pointer"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i} disabled={i < startHour}>{i.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grafik Line */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorsHourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="hour_label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {visitorsHourly.length === 0 && (
             <p className="text-center text-gray-400 text-sm mt-4">Tidak ada data di rentang waktu ini.</p>
          )}
        </div>

      </div>
    </div>
  );
}