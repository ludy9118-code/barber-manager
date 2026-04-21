import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct, getProductByBarcode } from '@/lib/products';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get('barcode');

  if (barcode) {
    const product = getProductByBarcode(barcode);
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    return NextResponse.json(product);
  }

  return NextResponse.json(getAllProducts());
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'El nombre del producto es obligatorio.' }, { status: 400 });
  }

  const product = createProduct({
    name: body.name,
    brand: body.brand ?? '',
    barcode: body.barcode ?? '',
    category: body.category ?? 'otro',
    unit: body.unit ?? 'unidad',
    stock: Number(body.stock) || 0,
    minStock: Number(body.minStock) || 0,
    costPrice: Number(body.costPrice) || 0,
    salePrice: Number(body.salePrice) || 0,
  });

  return NextResponse.json(product, { status: 201 });
}
