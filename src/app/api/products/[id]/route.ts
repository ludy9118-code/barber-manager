import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, adjustStock } from '@/lib/products';
import { addInventoryMovement } from '@/lib/inventory-movements';

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
  const ok = deleteProduct(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
