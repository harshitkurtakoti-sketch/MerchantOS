import { NextRequest, NextResponse } from 'next/server';
import { computeFinanceReadiness } from '@/lib/engines/finance_readiness';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const snapshot = computeFinanceReadiness(id);
  return NextResponse.json(snapshot);
}
