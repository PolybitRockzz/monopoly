import { NextResponse } from 'next/server';

export async function GET() {
  const url = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const service = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return NextResponse.json({ ok: url && anon, url, anon, service });
}
