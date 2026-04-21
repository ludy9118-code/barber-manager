import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAllAppointments } from '@/lib/appointments';
import path from 'path';
import fs from 'fs';

const ADMIN_KEY = process.env.ADMIN_KEY ?? '12345';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getAllAppointments());
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const clientPhone = ((formData.get('clientPhone') as string) ?? '').trim().replace(/\s+/g, '');

  if (!clientPhone || clientPhone.length < 7) {
    return NextResponse.json(
      { error: 'Debes ingresar un número de teléfono válido.' },
      { status: 400 }
    );
  }

  const phoneTaken = getAllAppointments().some((a) => a.clientPhone === clientPhone);
  if (phoneTaken) {
    return NextResponse.json(
      { error: 'Ya existe una solicitud con ese número. Inicia sesión para continuar.' },
      { status: 409 }
    );
  }

  const savePath = async (file: File | null, prefix: string): Promise<string> => {
    if (!file || file.size === 0) return '';
    const ext = file.name.split('.').pop() ?? 'jpg';
    const name = `${prefix}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, name), buffer);
    return `/uploads/${name}`;
  };

  const referencePhotoFile = formData.get('referencePhoto') as File | null;
  const currentPhotoFile = formData.get('currentPhoto') as File | null;

  const hairHistoryRaw = formData.get('hairHistory') as string;
  const hairHistory: string[] = hairHistoryRaw ? JSON.parse(hairHistoryRaw) : [];

  const appointment = createAppointment({
    fullName: (formData.get('fullName') as string) ?? '',
    procedure: (formData.get('procedure') as string) ?? '',
    dreamResult: (formData.get('dreamResult') as string) ?? '',
    referencePhotoPath: await savePath(referencePhotoFile, 'ref'),
    hairHistory,
    hairHistoryOther: (formData.get('hairHistoryOther') as string) ?? '',
    currentPhotoPath: await savePath(currentPhotoFile, 'current'),
    preferredDates: (formData.get('preferredDates') as string) ?? '',
    clientPhone,
  });

  return NextResponse.json({ id: appointment.id }, { status: 201 });
}
