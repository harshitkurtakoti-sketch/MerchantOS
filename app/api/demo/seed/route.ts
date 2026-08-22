import { NextResponse } from 'next/server';
import { seedSyntheticDemoBusiness } from '@/lib/demo/synthetic_generator';

export async function POST() {
  try {
    const { businessId, ownerId } = seedSyntheticDemoBusiness();
    return NextResponse.json({
      success: true,
      message: "Rukmini's Kirana & General Store loaded with 6 months of historical transactions, SKUs, and risk anomalies.",
      business_id: businessId,
      owner_id: ownerId,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Seeding failed' }, { status: 500 });
  }
}
