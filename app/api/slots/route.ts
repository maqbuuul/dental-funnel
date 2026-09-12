import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { availableDays, TZ } from '@/lib/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';   // availability is never cacheable

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT starts_at FROM appointments
       WHERE status = 'booked' AND starts_at > now()
    ` as { starts_at: string }[];

    const taken = new Set(rows.map((r) => new Date(r.starts_at).toISOString()));
    return NextResponse.json({ ok: true, timezone: TZ, days: availableDays(taken) });
  } catch (err) {
    console.error('slots failed', err);
    // Better to offer nothing than to offer a time that may already be gone.
    return NextResponse.json(
      { ok: false, error: 'availability_unavailable', days: [] },
      { status: 503 },
    );
  }
}
