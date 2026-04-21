import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointments';
import { sendPushNotification, hasPushConfig } from '@/lib/push';

const ADMIN_APPOINTMENT_ID = process.env.ADMIN_APPOINTMENT_ID ?? '';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => null) as { accepted: boolean; slot?: string } | null;

  if (!body || typeof body.accepted !== 'boolean') {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }

  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!appointment.confirmedSlot && !body.slot && body.accepted) {
    return NextResponse.json({ error: 'Debes indicar el turno a confirmar.' }, { status: 400 });
  }

  const slot = body.slot ?? appointment.confirmedSlot;

  updateAppointment(id, {
    confirmedSlot: slot,
    slotConfirmedAt: new Date().toISOString(),
    slotAccepted: body.accepted,
  });

  // Notify admin via push if there are admin subscriptions configured
  if (hasPushConfig() && ADMIN_APPOINTMENT_ID) {
    const adminAppt = getAppointmentById(ADMIN_APPOINTMENT_ID);
    if (adminAppt) {
      const msg = body.accepted
        ? `✅ ${appointment.fullName} aceptó el turno: ${slot}`
        : `❌ ${appointment.fullName} rechazó el turno: ${slot}`;

      await Promise.allSettled(
        adminAppt.pushSubscriptions.map((sub) =>
          sendPushNotification(sub, {
            title: 'Color Studio — Confirmación de turno',
            body: msg,
            url: `/admin`,
          })
        )
      );
    }
  }

  return NextResponse.json({ ok: true, accepted: body.accepted, slot });
}
