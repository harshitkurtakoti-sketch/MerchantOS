import { NextRequest, NextResponse } from 'next/server';
import { runReverseLoanSimulation } from '@/lib/engines/loan_simulator';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const amount = body.loan_amount || 500000;
  const interest = body.interest_rate || 14.0;
  const tenure = body.tenure_months || 12;

  const res = runReverseLoanSimulation(id, amount, interest, tenure);
  return NextResponse.json(res);
}
