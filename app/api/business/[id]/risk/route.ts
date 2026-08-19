import { NextRequest, NextResponse } from 'next/server';
import { evaluateRiskGraph } from '@/lib/engines/risk';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const events = evaluateRiskGraph(id);
  return NextResponse.json({ risk_events: events });
}
