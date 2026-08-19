import { NextRequest, NextResponse } from 'next/server';
import { computeFinancialHealth } from '@/lib/engines/health';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const snapshot = computeFinancialHealth(id);
  return NextResponse.json(snapshot);
}
