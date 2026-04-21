import webpush from 'web-push';
import type { PushSubscriptionData } from '@/lib/appointments';

const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

export function hasPushConfig() {
  return Boolean(VAPID_SUBJECT && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

function configureWebPush() {
  if (!hasPushConfig()) return false;
  webpush.setVapidDetails(VAPID_SUBJECT as string, VAPID_PUBLIC_KEY as string, VAPID_PRIVATE_KEY as string);
  return true;
}

export function getPublicVapidKey() {
  return VAPID_PUBLIC_KEY ?? '';
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  if (!configureWebPush()) return false;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
