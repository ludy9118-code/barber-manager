import { NextRequest, NextResponse } from 'next/server';
import { getInventoryMovements } from '@/lib/inventory-movements';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit')) || 50;

  return NextResponse.json(getInventoryMovements(limit));
}
