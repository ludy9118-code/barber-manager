import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointments';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { isDbEnabled, asArray, ensureAppointmentRow } from '@/lib/db-helpers';
import { Prisma } from '@prisma/client';
import { isValidAdminKey } from '@/lib/admin-auth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const key = req.headers.get('x-admin-key');
  if (!isValidAdminKey(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appointment = getAppointmentById(id);
  if (!isDbEnabled() && !appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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

  if (isDbEnabled()) {
    const row = await ensureAppointmentRow(id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        accountingEntries: [...asArray<Record<string, unknown>>(row.accountingEntries), entry] as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ entry, accountingEntries: asArray(updated.accountingEntries) });
  }

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = updateAppointment(id, {
    accountingEntries: [...(appointment.accountingEntries ?? []), entry],
  });

  return NextResponse.json({ entry, accountingEntries: updated?.accountingEntries });
}
