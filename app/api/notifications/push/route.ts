import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as {
      title?: string;
      message?: string;
      business_id?: string;
    };
    const {
      title = 'MerchantOS Scenario Risk Alert',
      message = 'Simulation Warning: Projected cash balance dips below ₹65,000 safety threshold on Day 14.',
      business_id = 'biz_rukmini_store',
    } = body;

    // Single real trigger notification response
    return NextResponse.json({
      success: true,
      notification: {
        title,
        body: message,
        business_id,
        timestamp: new Date().toISOString(),
        icon: '/merchantos_logo.png',
        trigger_event: 'SCENARIO_RISK_THRESHOLD_EXCEEDED',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Push notification failed' }, { status: 500 });
  }
}
