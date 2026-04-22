import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointments';
import { sendPushNotification, hasPushConfig } from '@/lib/push';
import { isValidAdminKey } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  if (!isValidAdminKey(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    appointmentId?: string;
    slot?: string; // ISO datetime string or human-readable label
  } | null;

  if (!body?.appointmentId || !body.slot?.trim()) {
    return NextResponse.json({ error: 'appointmentId y slot son obligatorios.' }, { status: 400 });
  }

  const appointment = getAppointmentById(body.appointmentId);
  if (!appointment) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });

  if (!hasPushConfig()) {
    // Still save the slot even if push is not configured
    await updateAppointment(appointment.id, {
      availableSlots: [body.slot.trim()],
      notifiedAt: new Date().toISOString(),
      status: 'accepted',
    });
    return NextResponse.json({ ok: true, pushed: false, reason: 'push_not_configured' });
  }

  if (appointment.pushSubscriptions.length === 0) {
    await updateAppointment(appointment.id, {
      availableSlots: [body.slot.trim()],
      notifiedAt: new Date().toISOString(),
      status: 'accepted',
    });
    return NextResponse.json({ ok: true, pushed: false, reason: 'no_subscriptions' });
  }

  const clientName = appointment.fullName.split(' ')[0];
  const results = await Promise.allSettled(
    appointment.pushSubscriptions.map((sub) =>
      sendPushNotification(sub, {
        title: `Color Studio — Tu cita, ${clientName}`,
        body: `📅 Tu turno propuesto: ${body.slot}\n¿Te queda bien? Entra a confirmar o rechazar.`,
        url: `/appointment/status/${appointment.id}`,
      })
    )
  );

  const pushed = results.some((r) => r.status === 'fulfilled' && r.value === true);

  await updateAppointment(appointment.id, {
    availableSlots: [body.slot!.trim()],
    notifiedAt: new Date().toISOString(),
    status: 'accepted',
    notificationLog: [
      ...(appointment.notificationLog ?? []),
      `[${new Date().toISOString()}] Slot sent: ${body.slot} — pushed: ${pushed}`,
    ],
  });

  return NextResponse.json({ ok: true, pushed });
}
