import { NextRequest, NextResponse } from 'next/server';
import { getSmartProcurementRecommendations } from '@/lib/engines/procurement';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = getSmartProcurementRecommendations(id);
  return NextResponse.json(res);
}
