'use server';

import { createAdminClient } from '@/lib/supabase/server';

// --- Interfaces ---

export interface VisitorOverview {
  totalVisitors: number;
  visitorsToday: number;
}

export interface VisitorsByDay {
  date: string;
  label: string;
  count: number;
}

export interface VisitorHourly {
  hour_label: string;
  count: number;
}

// --- Functions ---

export async function getVisitorOverview(): Promise<VisitorOverview> {
  const supabase = await createAdminClient();
  
  // Total visitors
  const { count: totalVisitorsCount, error: totalError } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total visitors:', totalError);
    return { totalVisitors: 0, visitorsToday: 0 };
  }

  // Visitors today
  const today = new Date().toISOString().split('T')[0];
  const { count: visitorsTodayCount, error: todayError } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .eq('visit_date', today);

  if (todayError) {
    console.error('Error fetching visitors today:', todayError);
    return { totalVisitors: totalVisitorsCount || 0, visitorsToday: 0 };
  }

  return {
    totalVisitors: totalVisitorsCount || 0,
    visitorsToday: visitorsTodayCount || 0,
  };
}

export async function getVisitorsByDay(days: number = 7): Promise<VisitorsByDay[]> {
  const supabase = await createAdminClient();
  
  // Prepare dates for the last N days
  const dateRange: VisitorsByDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateRange.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      count: 0, // Default count
    });
  }

  const startDate = dateRange[0].date;
  
  // OPTIMASI: Filter langsung di database menggunakan .gte (Greater Than or Equal)
  // Ini mencegah pengambilan seluruh isi tabel yang tidak perlu
  const { data: visitors, error } = await supabase
    .from('visitors')
    .select('visit_date')
    .gte('visit_date', startDate); 

  if (error) {
    console.error('Error fetching visitors by day:', error);
    return dateRange;
  }

  // Group by date
  const visitorMap = new Map<string, number>();
  visitors?.forEach(v => {
    // Kita parsing tanggalnya untuk memastikan formatnya cocok (kadang database mengembalikan timestamp)
    const dateStr = v.visit_date.toString().split('T')[0];
    visitorMap.set(dateStr, (visitorMap.get(dateStr) || 0) + 1);
  });

  // Map to the final result structure
  const result = dateRange.map(day => ({
    ...day,
    count: visitorMap.get(day.date) || 0,
  }));

  return result;
}

// BARU: Fungsi untuk Line Chart (Jam)
export async function getVisitorsByHour(date: string, startHour: number, endHour: number): Promise<VisitorHourly[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_visitors_by_hour', {
    p_date: date,
    p_start_hour: startHour,
    p_end_hour: endHour,
  });

  if (error) {
    console.error('Error fetching hourly visitors:', error);
    return [];
  }

  return data as VisitorHourly[];
}