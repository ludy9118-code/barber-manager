import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointments';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const appointment = getAppointmentById(id);
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const {
    pushSubscriptions,
    ...safeData
  } = appointment;
  return NextResponse.json(safeData);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const key = req.headers.get('x-admin-key');
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const updated = updateAppointment(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
