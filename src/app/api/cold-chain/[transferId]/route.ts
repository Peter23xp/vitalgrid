import { NextRequest } from 'next/server';
import { getColdChainData } from '@/lib/repos/cold-chain';
import { apiOk, apiError } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  try {
    const { transferId } = await params;
    if (!transferId) return apiError('transferId requis');
    const hoursBack = Number(req.nextUrl.searchParams.get('hoursBack') ?? 24);
    const data = await getColdChainData(transferId, hoursBack);
    return apiOk(data);
  } catch (e: unknown) {
    const err = e as Error;
    console.error('cold-chain API error:', err.message);
    return apiError('Erreur DynamoDB', 500);
  }
}
