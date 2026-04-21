import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, AppointmentProduct } from '@/lib/appointments';
import { getProductById, adjustStock } from '@/lib/products';
import { addInventoryMovement } from '@/lib/inventory-movements';
import { randomUUID } from 'crypto';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY;
}

// GET — list products used in this appointment
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(appointment.productsUsed ?? []);
}

// POST — add a product used in this appointment (deducts from stock)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const body = await req.json().catch(() => null) as {
    productId: string;
    quantity: number;
    usedBy?: string;
  } | null;

  if (!body?.productId || !body.quantity || body.quantity <= 0) {
    return NextResponse.json({ error: 'productId y quantity (> 0) son obligatorios.' }, { status: 400 });
  }

  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

  const product = getProductById(body.productId);
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  if (product.stock < body.quantity) {
    return NextResponse.json(
      { error: `Stock insuficiente. Disponible: ${product.stock} ${product.unit}.` },
      { status: 409 }
    );
  }

  const entry: AppointmentProduct = {
    id: randomUUID(),
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    quantity: body.quantity,
    unit: product.unit,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    usedAt: new Date().toISOString(),
    usedBy: body.usedBy?.trim() ?? '',
  };

  // Deduct from inventory
  const updatedProduct = adjustStock(product.id, -body.quantity);

  if (updatedProduct) {
    addInventoryMovement({
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      unit: product.unit,
      quantity: body.quantity,
      type: 'sale',
      reason: 'Salida por consumo en caja',
      by: body.usedBy?.trim() ?? 'Profesional',
      appointmentId: id,
      remainingStock: updatedProduct.stock,
    });
  }

  // Add to appointment
  await updateAppointment(id, {
    productsUsed: [...(appointment.productsUsed ?? []), entry],
  });

  return NextResponse.json({
    ok: true,
    entry,
    remainingStock: updatedProduct?.stock ?? Math.max(0, product.stock - body.quantity),
  });
}

// DELETE — remove a product entry and restore stock
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get('entryId');
  if (!entryId) return NextResponse.json({ error: 'entryId es obligatorio' }, { status: 400 });

  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const entry = (appointment.productsUsed ?? []).find((p) => p.id === entryId);
  if (!entry) return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 });

  // Restore stock
  const restoredProduct = adjustStock(entry.productId, entry.quantity);

  if (restoredProduct) {
    addInventoryMovement({
      productId: entry.productId,
      productName: entry.productName,
      barcode: getProductById(entry.productId)?.barcode ?? '',
      unit: entry.unit,
      quantity: entry.quantity,
      type: 'return',
      reason: 'Reversion de salida en cita',
      by: entry.usedBy?.trim() ?? 'Sistema',
      appointmentId: id,
      remainingStock: restoredProduct.stock,
    });
  }

  await updateAppointment(id, {
    productsUsed: appointment.productsUsed.filter((p) => p.id !== entryId),
  });

  return NextResponse.json({ ok: true });
}
