import { NextRequest, NextResponse } from 'next/server';
import { getAllAppointments, updateAppointment } from '@/lib/appointments';
import { getTreatmentById } from '@/lib/treatments';
import { sendPushNotification } from '@/lib/push';

const CRON_SECRET = process.env.CRON_SECRET ?? '';
const REMINDER_UTC_OFFSET = Number(process.env.REMINDER_UTC_OFFSET ?? '-5');
const SLOT_HOURS = [9, 14, 20];

function getSlotLabel(hour: number) {
  if (hour === 9) return 'manana';
  if (hour === 14) return 'tarde';
  return 'noche';
}

function diffInDays(startDateIso: string, endDate: Date) {
  const start = new Date(startDateIso);
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((endUtc - startUtc) / msPerDay);
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-cron-secret');
  const authorization = req.headers.get('authorization') ?? '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const validSecret = token === CRON_SECRET || bearer === CRON_SECRET;

  if (!CRON_SECRET || !validSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nowUtc = new Date();
  const localNow = new Date(nowUtc.getTime() + REMINDER_UTC_OFFSET * 60 * 60 * 1000);
  const hour = localNow.getUTCHours();
  if (!SLOT_HOURS.includes(hour)) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Hora fuera de ventana de envio.', hour });
  }

  const slot = getSlotLabel(hour);
  const day = localNow.toISOString().slice(0, 10);
  const logKey = `${day}-${slot}`;

  const acceptedClients = getAllAppointments().filter((a) => a.status === 'accepted' && a.pushSubscriptions.length > 0 && a.treatmentsDone.length > 0);

  let sent = 0;

  for (const client of acceptedClients) {
    if (client.notificationLog.includes(logKey)) continue;

    const latestTreatment = client.treatmentsDone[client.treatmentsDone.length - 1];
    const info = getTreatmentById(latestTreatment.treatmentId);
    if (!info || info.reminders.length === 0) continue;

    const elapsedDays = diffInDays(latestTreatment.performedAt, localNow);
    const dueReminder = info.reminders.find((r) => r.daysAfter === elapsedDays);
    if (!dueReminder) continue;

    const payload = {
      title: `Hola ${client.fullName.split(' ')[0]}, cuidado ${info.name}`,
      body: `${dueReminder.title}: ${dueReminder.message}`,
      url: `/appointment/status/${client.id}`,
    };

    let delivered = false;
    const validSubscriptions = [...client.pushSubscriptions];

    for (const subscription of client.pushSubscriptions) {
      const ok = await sendPushNotification(subscription, payload);
      delivered = delivered || ok;
      if (!ok) {
        const idx = validSubscriptions.findIndex((s) => s.endpoint === subscription.endpoint);
        if (idx >= 0) validSubscriptions.splice(idx, 1);
      }
    }

    if (delivered) {
      updateAppointment(client.id, {
        notificationLog: [...client.notificationLog, logKey],
        pushSubscriptions: validSubscriptions,
      });
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, slot, sent, hour, offset: REMINDER_UTC_OFFSET });
}
