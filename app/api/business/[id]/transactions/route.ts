import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/mock_store';
import { Transaction } from '@/lib/db/types';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  const newTxn: Transaction = {
    id: `txn_manual_${Date.now()}`,
    business_id: id,
    type: body.type || 'income',
    category: body.category || 'General',
    amount: Number(body.amount),
    counterparty: body.counterparty || 'Walk-in Customer',
    payment_method: body.payment_method || 'upi',
    transaction_date: body.transaction_date || new Date().toISOString(),
    source: 'manual',
    created_at: new Date().toISOString(),
  };

  store.transactions.unshift(newTxn);

  return NextResponse.json({ success: true, transaction: newTxn });
}
