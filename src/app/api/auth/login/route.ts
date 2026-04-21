import { NextRequest, NextResponse } from 'next/server';
import { getAllAppointments } from '@/lib/appointments';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { phone?: string } | null;
  const phone = body?.phone?.trim().replace(/\s+/g, '') ?? '';

  if (!phone) {
    return NextResponse.json({ error: 'El número de teléfono es obligatorio.' }, { status: 400 });
  }

  const appointment = getAllAppointments().find((a) => a.clientPhone === phone);
  if (!appointment) {
    return NextResponse.json({ error: 'No existe una cuenta con ese número de teléfono.' }, { status: 404 });
  }

  if (appointment.status !== 'accepted') {
    return NextResponse.json(
      { error: 'Tu solicitud aún no fue aceptada. Te avisaremos cuando se habilite tu acceso.' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    id: appointment.id,
    fullName: appointment.fullName,
    status: appointment.status,
  });
}
