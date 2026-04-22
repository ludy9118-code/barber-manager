import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointments';
import { prisma } from '@/lib/prisma';
import { isDbEnabled, ensureAppointmentRow } from '@/lib/db-helpers';
import { Prisma } from '@prisma/client';
import { isValidAdminKey } from '@/lib/admin-auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (isDbEnabled()) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const safeData = { ...appointment, pushSubscriptions: undefined };
    return NextResponse.json(safeData);
  }

  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const safeData = { ...appointment, pushSubscriptions: undefined };
  return NextResponse.json(safeData);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const key = req.headers.get('x-admin-key');
  if (!isValidAdminKey(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  if (isDbEnabled()) {
    const existing = await ensureAppointmentRow(id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(typeof body.status === 'string' ? { status: body.status } : {}),
        ...(typeof body.fullName === 'string' ? { fullName: body.fullName } : {}),
        ...(typeof body.procedure === 'string' ? { procedure: body.procedure } : {}),
        ...(typeof body.dreamResult === 'string' ? { dreamResult: body.dreamResult } : {}),
        ...(typeof body.referencePhotoPath === 'string' ? { referencePhotoPath: body.referencePhotoPath } : {}),
        ...(typeof body.hairHistoryOther === 'string' ? { hairHistoryOther: body.hairHistoryOther } : {}),
        ...(typeof body.currentPhotoPath === 'string' ? { currentPhotoPath: body.currentPhotoPath } : {}),
        ...(typeof body.preferredDates === 'string' ? { preferredDates: body.preferredDates } : {}),
        ...(typeof body.clientPhone === 'string' ? { clientPhone: body.clientPhone } : {}),
        ...(typeof body.adminNotes === 'string' ? { adminNotes: body.adminNotes } : {}),
        ...(typeof body.notifiedAt === 'string' ? { notifiedAt: body.notifiedAt } : {}),
        ...(typeof body.confirmedSlot === 'string' ? { confirmedSlot: body.confirmedSlot } : {}),
        ...(typeof body.slotConfirmedAt === 'string' ? { slotConfirmedAt: body.slotConfirmedAt } : {}),
        ...(typeof body.slotAccepted === 'boolean' || body.slotAccepted === null ? { slotAccepted: body.slotAccepted } : {}),
        ...(Array.isArray(body.hairHistory) ? { hairHistory: body.hairHistory as Prisma.InputJsonValue } : {}),
        ...(Array.isArray(body.availableSlots) ? { availableSlots: body.availableSlots as Prisma.InputJsonValue } : {}),
        ...(Array.isArray(body.treatmentsDone) ? { treatmentsDone: body.treatmentsDone as Prisma.InputJsonValue } : {}),
        ...(Array.isArray(body.accountingEntries) ? { accountingEntries: body.accountingEntries as Prisma.InputJsonValue } : {}),
        ...(Array.isArray(body.productsUsed) ? { productsUsed: body.productsUsed as Prisma.InputJsonValue } : {}),
        ...(Array.isArray(body.pushSubscriptions) ? { pushSubscriptions: body.pushSubscriptions as Prisma.InputJsonValue } : {}),
        ...(Array.isArray(body.notificationLog) ? { notificationLog: body.notificationLog as Prisma.InputJsonValue } : {}),
      },
    });
    return NextResponse.json(updated);
  }

  const updated = updateAppointment(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
