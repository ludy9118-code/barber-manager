import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointments';
import { randomUUID } from 'crypto';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const key = req.headers.get('x-admin-key');
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json() as {
    service: string;
    amount: number;
    performedBy: string;
    notes?: string;
    performedAt?: string;
  };

  if (!body.service?.trim() || !body.performedBy?.trim() || !(Number(body.amount) > 0)) {
    return NextResponse.json({ error: 'service, performedBy y amount son requeridos.' }, { status: 400 });
  }

  const entry = {
    id: randomUUID(),
    service: body.service.trim(),
    amount: Number(body.amount),
    performedBy: body.performedBy.trim(),
    performedAt: body.performedAt ?? new Date().toISOString().split('T')[0],
    notes: body.notes?.trim() ?? '',
  };

  const updated = updateAppointment(id, {
    accountingEntries: [...(appointment.accountingEntries ?? []), entry],
  });

  return NextResponse.json({ entry, accountingEntries: updated?.accountingEntries });
}
