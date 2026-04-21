import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, type PushSubscriptionData } from '@/lib/appointments';

interface SubscribeBody {
  appointmentId?: string;
  subscription?: PushSubscriptionData;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as SubscribeBody | null;

  if (!body?.appointmentId || !body.subscription?.endpoint) {
    return NextResponse.json({ error: 'Datos de suscripcion incompletos.' }, { status: 400 });
  }

  const appointment = getAppointmentById(body.appointmentId);
  if (!appointment) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });

  if (appointment.status !== 'accepted') {
    return NextResponse.json({ error: 'Las notificaciones se habilitan cuando tu solicitud sea aceptada.' }, { status: 403 });
  }

  const exists = appointment.pushSubscriptions.some((s) => s.endpoint === body.subscription?.endpoint);
  const pushSubscriptions = exists
    ? appointment.pushSubscriptions
    : [...appointment.pushSubscriptions, body.subscription];

  updateAppointment(appointment.id, { pushSubscriptions });

  return NextResponse.json({ ok: true, saved: !exists });
}
