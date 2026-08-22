import { NextRequest, NextResponse } from 'next/server';
import { getDigitalTwinState, updateDigitalTwinParameters } from '@/lib/engines/digital_twin';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const twin = getDigitalTwinState(id);
  return NextResponse.json(twin);
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const updatedTwin = updateDigitalTwinParameters(id, {
    cash_adjustment: body.cash_adjustment !== undefined ? Number(body.cash_adjustment) : undefined,
    customer_delay_days: body.customer_delay_days !== undefined ? Number(body.customer_delay_days) : undefined,
    supplier_terms_days: body.supplier_terms_days !== undefined ? Number(body.supplier_terms_days) : undefined,
  });
  return NextResponse.json({
    success: true,
    message: 'Digital Twin calibrated successfully',
    twin: updatedTwin,
  });
}

