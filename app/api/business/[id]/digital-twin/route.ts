import { NextRequest, NextResponse } from 'next/server';
import { getDigitalTwinState } from '@/lib/engines/digital_twin';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const twin = getDigitalTwinState(id);
  return NextResponse.json(twin);
}
