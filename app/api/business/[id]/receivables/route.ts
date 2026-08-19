import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/mock_store';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  if (body.type === 'payable') {
    const newPayable = {
      id: `pay_manual_${Date.now()}`,
      business_id: id,
      supplier_id: 'sup_laxmi',
      invoice_ref: body.invoice_ref,
      amount: Number(body.amount),
      due_date: body.due_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'open' as const,
      created_at: new Date().toISOString(),
    };
    store.payables.unshift(newPayable);
    return NextResponse.json({ success: true, item: newPayable });
  } else {
    const newReceivable = {
      id: `rec_manual_${Date.now()}`,
      business_id: id,
      customer_id: 'cust_01',
      invoice_ref: body.invoice_ref,
      amount: Number(body.amount),
      due_date: body.due_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'open' as const,
      created_at: new Date().toISOString(),
    };
    store.receivables.unshift(newReceivable);
    return NextResponse.json({ success: true, item: newReceivable });
  }
}
