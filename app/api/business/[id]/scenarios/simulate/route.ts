import { NextRequest, NextResponse } from 'next/server';
import { runDeterministicScenario } from '@/lib/engines/scenario';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const assumptions = await req.json();
  const result = runDeterministicScenario(id, assumptions);
  return NextResponse.json(result);
}
