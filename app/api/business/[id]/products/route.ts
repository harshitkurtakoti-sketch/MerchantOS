import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/mock_store';
import { Product } from '@/lib/db/types';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  const newProd: Product = {
    id: `prod_manual_${Date.now()}`,
    business_id: id,
    name: body.name,
    sku: body.sku || `SKU-${Date.now().toString().slice(-4)}`,
    category: body.category || 'General',
    cost_price: Number(body.cost_price || 0),
    selling_price: Number(body.selling_price),
    active: true,
    created_at: new Date().toISOString(),
  };

  store.products.unshift(newProd);

  return NextResponse.json({ success: true, product: newProd });
}
