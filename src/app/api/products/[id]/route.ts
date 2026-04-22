import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, adjustStock } from '@/lib/products';
import { addInventoryMovement } from '@/lib/inventory-movements';
import { prisma } from '@/lib/prisma';
import { isDbEnabled, ensureProductRow } from '@/lib/db-helpers';
import { randomUUID } from 'crypto';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  if (isDbEnabled()) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  }

  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  if (isDbEnabled()) {
    // stockAdjust is a delta (negative to deduct, positive to add)
    if (typeof body.stockAdjust === 'number') {
      const original = (await prisma.product.findUnique({ where: { id } })) ?? (await ensureProductRow(id));
      if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const nextStock = Math.max(0, Number(original.stock) + Number(body.stockAdjust));
      const updated = await prisma.product.update({
        where: { id },
        data: { stock: Math.trunc(nextStock) },
      });

      await prisma.inventoryMovement.create({
        data: {
          id: randomUUID(),
          productId: original.id,
          productName: original.name,
          barcode: original.barcode,
          unit: original.unit,
          quantity: Math.abs(Math.trunc(Number(body.stockAdjust) || 0)),
          type: body.stockAdjust >= 0 ? 'restock' : 'adjustment',
          reason: body.reason?.trim?.() || (body.stockAdjust >= 0 ? 'Entrada manual de inventario' : 'Salida manual de inventario'),
          by: body.by?.trim?.() || 'Sistema',
          appointmentId: body.appointmentId?.trim?.() || '',
          remainingStock: updated.stock,
        },
      });

      return NextResponse.json(updated);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(typeof body.name === 'string' ? { name: body.name } : {}),
        ...(typeof body.brand === 'string' ? { brand: body.brand } : {}),
        ...(typeof body.barcode === 'string' ? { barcode: body.barcode } : {}),
        ...(typeof body.category === 'string' ? { category: body.category } : {}),
        ...(typeof body.unit === 'string' ? { unit: body.unit } : {}),
        ...(typeof body.stock === 'number' ? { stock: Math.trunc(body.stock) } : {}),
        ...(typeof body.minStock === 'number' ? { minStock: Math.trunc(body.minStock) } : {}),
        ...(typeof body.costPrice === 'number' ? { costPrice: Number(body.costPrice) } : {}),
        ...(typeof body.salePrice === 'number' ? { salePrice: Number(body.salePrice) } : {}),
      },
    }).catch(() => null);

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  // stockAdjust is a delta (negative to deduct, positive to add)
  if (typeof body.stockAdjust === 'number') {
    const original = getProductById(id);
    const updated = adjustStock(id, body.stockAdjust);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (original) {
      addInventoryMovement({
        productId: original.id,
        productName: original.name,
        barcode: original.barcode,
        unit: original.unit,
        quantity: Math.abs(body.stockAdjust),
        type: body.stockAdjust >= 0 ? 'restock' : 'adjustment',
        reason: body.reason?.trim?.() || (body.stockAdjust >= 0 ? 'Entrada manual de inventario' : 'Salida manual de inventario'),
        by: body.by?.trim?.() || 'Sistema',
        appointmentId: body.appointmentId?.trim?.() || '',
        remainingStock: updated.stock,
      });
    }

    return NextResponse.json(updated);
  }

  const updated = updateProduct(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  if (isDbEnabled()) {
    await prisma.product.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  const ok = deleteProduct(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
