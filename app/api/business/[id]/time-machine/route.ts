import { NextRequest, NextResponse } from 'next/server';
import { computeTimeMachineForecast } from '@/lib/engines/time_machine';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const horizon = body.horizon_days || 90;
  const forecast = computeTimeMachineForecast(id, horizon, body.assumptions || {});
  return NextResponse.json(forecast);
}
