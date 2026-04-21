import { NextRequest, NextResponse } from 'next/server';
import { getAllAppointments } from '@/lib/appointments';

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')?.trim().replace(/\s+/g, '');
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 });

  const normalized = phone.replace(/[\s\-().+]/g, '');

  const all = getAllAppointments().filter((a) => {
    const ap = (a.clientPhone ?? '').replace(/[\s\-().+]/g, '');
    return ap === normalized && a.status === 'accepted';
  });

  const safe = all.map((a) => ({
    id: a.id,
    createdAt: a.createdAt,
    status: a.status,
    fullName: a.fullName,
    procedure: a.procedure,
    confirmedSlot: a.confirmedSlot,
    slotAccepted: a.slotAccepted,
    treatmentsDone: a.treatmentsDone ?? [],
    accountingEntries: a.accountingEntries ?? [],
    productsUsed: a.productsUsed ?? [],
  }));

  return NextResponse.json(safe);
}
