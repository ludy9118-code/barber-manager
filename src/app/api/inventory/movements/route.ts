import { NextRequest, NextResponse } from 'next/server';
import { getInventoryMovements } from '@/lib/inventory-movements';
import { prisma } from '@/lib/prisma';
import { isDbEnabled } from '@/lib/db-helpers';
import { isValidAdminKey } from '@/lib/admin-auth';

function checkAuth(req: NextRequest) {
  return isValidAdminKey(req.headers.get('x-admin-key'));
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit')) || 50;

  if (isDbEnabled()) {
    const items = await prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, Math.min(limit, 200)),
    });
    return NextResponse.json(items);
  }

  return NextResponse.json(getInventoryMovements(limit));
}
