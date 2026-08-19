import { NextRequest, NextResponse } from 'next/server';
import { computeCommerceIntelligence } from '@/lib/engines/commerce';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = computeCommerceIntelligence(id);
  return NextResponse.json({ products: data });
}
