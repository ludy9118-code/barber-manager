import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface TreatmentRecord {
  id: string;
  treatmentId: string;
  treatmentName: string;
  performedAt: string;
  notes: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface AccountingEntry {
  id: string;
  service: string;
  amount: number;
  performedBy: string;
  performedAt: string;
  notes: string;
}

export interface AppointmentProduct {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  costPrice: number;  // price at time of use
  salePrice: number;  // price charged to client at time of use
  usedAt: string;
  usedBy: string; // professional name
}

export type AppointmentStatus = 'pending' | 'accepted' | 'rejected';

export interface Appointment {
  id: string;
  createdAt: string;
  status: AppointmentStatus;
  fullName: string;
  procedure: string;
  dreamResult: string;
  referencePhotoPath: string;
  hairHistory: string[];
  hairHistoryOther: string;
  currentPhotoPath: string;
  preferredDates: string;
  clientPhone: string;
  adminNotes: string;
  availableSlots: string[];
  notifiedAt: string;
  confirmedSlot: string;
  slotConfirmedAt: string;
  slotAccepted: boolean | null;
  treatmentsDone: TreatmentRecord[];
  accountingEntries: AccountingEntry[];
  productsUsed: AppointmentProduct[];
  pushSubscriptions: PushSubscriptionData[];
  notificationLog: string[];
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'appointments.json');

function normalizeAppointment(raw: Partial<Appointment>): Appointment {
  return {
    id: raw.id ?? randomUUID(),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    status: raw.status ?? 'pending',
    fullName: raw.fullName ?? '',
    procedure: raw.procedure ?? '',
    dreamResult: raw.dreamResult ?? '',
    referencePhotoPath: raw.referencePhotoPath ?? '',
    hairHistory: raw.hairHistory ?? [],
    hairHistoryOther: raw.hairHistoryOther ?? '',
    currentPhotoPath: raw.currentPhotoPath ?? '',
    preferredDates: raw.preferredDates ?? '',
    clientPhone: raw.clientPhone ?? '',
    adminNotes: raw.adminNotes ?? '',
    availableSlots: raw.availableSlots ?? [],
    notifiedAt: raw.notifiedAt ?? '',
    confirmedSlot: raw.confirmedSlot ?? '',
    slotConfirmedAt: raw.slotConfirmedAt ?? '',
    slotAccepted: raw.slotAccepted ?? null,
    treatmentsDone: raw.treatmentsDone ?? [],
    accountingEntries: raw.accountingEntries ?? [],
    productsUsed: raw.productsUsed ?? [],
    pushSubscriptions: raw.pushSubscriptions ?? [],
    notificationLog: raw.notificationLog ?? [],
  };
}

function readAll(): Appointment[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<Appointment>[];
    return parsed.map(normalizeAppointment);
  } catch {
    return [];
  }
}

function writeAll(data: Appointment[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllAppointments(): Appointment[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAppointmentById(id: string): Appointment | null {
  return readAll().find((a) => a.id === id) ?? null;
}

export function createAppointment(
  data: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'adminNotes' | 'availableSlots' | 'notifiedAt' | 'confirmedSlot' | 'slotAccepted' | 'slotConfirmedAt' | 'treatmentsDone' | 'accountingEntries' | 'productsUsed' | 'pushSubscriptions' | 'notificationLog'>
): Appointment {
  const all = readAll();
  const appointment: Appointment = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    adminNotes: '',
    availableSlots: [],
    notifiedAt: '',
    confirmedSlot: '',
    slotAccepted: null,
    slotConfirmedAt: '',
    treatmentsDone: [],
    accountingEntries: [],
    productsUsed: [],
    pushSubscriptions: [],
    notificationLog: [],
    ...data,
  };
  all.push(appointment);
  writeAll(all);
  return appointment;
}

export function updateAppointment(id: string, patch: Partial<Appointment>): Appointment | null {
  const all = readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  writeAll(all);
  return all[idx];
}
