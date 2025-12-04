// src/app/api/record-visitor/route.js
import { createClient } from "@/lib/supabase/client";
import { headers } from 'next/headers';

/**
 * POST /api/record-visitor
 * Body: { tenant_id: "uuid" } (optional)
 * Records a visitor entry with metadata
 */
export async function POST(req) {
  const supabase = createClient();

  try {
    const body = await req.json();
    const { tenant_id } = body;

    // Get request metadata
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referer = headersList.get('referer') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown';

    // Build metadata
    const metadata = {
      userAgent,
      referer,
      ip: ip.split(',')[0].trim(), // first IP if multiple
      recordedAt: new Date().toISOString(),
    };

    // Insert visitor record
    const { error } = await supabase.from("visitors").insert([
      {
        tenant_id: tenant_id || null,
        metadata,
      },
    ]);

    if (error) {
      console.error("Supabase Error:", error.message);
      return Response.json(
        { success: false, message: "Gagal mencatat kunjungan", error: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Kunjungan berhasil dicatat" },
      { status: 201 }
    );
  } catch (error) {
    console.error("General Server Error:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ message: "Method Not Allowed. Use POST." }, { status: 405 });
}
