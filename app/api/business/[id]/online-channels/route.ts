import { NextRequest, NextResponse } from 'next/server';
import { getOnlineChannelRecommendations } from '@/lib/engines/online_expansion';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = getOnlineChannelRecommendations(id);
  return NextResponse.json(res);
}
