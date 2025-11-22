// src/lib/actions/visitors/index.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';

export interface VisitorOverview {
  totalVisitors: number;
  visitorsToday: number;
}

export interface VisitorsByDay {
  date: string;
  label: string;
  count: number;
}

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
  const dateRange = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateRange.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }

  // Fetch all visitors in the last N days
  const startDate = dateRange[0].date;
  
  const { data: visitors, error } = await supabase
    .from('visitors')
    .select('visit_date');

  if (error) {
    console.error('Error fetching visitors by day:', error);
    return dateRange.map(d => ({ ...d, count: 0 }));
  }

  // Group by date
  const visitorMap = new Map<string, number>();
  visitors?.forEach(v => {
    // Only count visitors within the range
    if (v.visit_date >= startDate) {
      visitorMap.set(v.visit_date, (visitorMap.get(v.visit_date) || 0) + 1);
    }
  });

  // Map to the final result structure
  const result = dateRange.map(day => ({
    ...day,
    count: visitorMap.get(day.date) || 0,
  }));

  return result;
}