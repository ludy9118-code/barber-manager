import { NextResponse } from 'next/server';
import { getPublicVapidKey, hasPushConfig } from '@/lib/push';

export async function GET() {
  if (!hasPushConfig()) {
    return NextResponse.json({ error: 'Push no configurado en el servidor.' }, { status: 503 });
  }

  return NextResponse.json({ publicKey: getPublicVapidKey() });
}
