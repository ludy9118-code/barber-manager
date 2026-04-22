import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAppointmentById as getFileAppointment } from '@/lib/appointments';
import { getProductById as getFileProduct } from '@/lib/products';
import { Prisma } from '@prisma/client';

type JsonArray<T> = T[];

export function isDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function asArray<T>(value: unknown): JsonArray<T> {
  return Array.isArray(value) ? (value as JsonArray<T>) : [];
}

export async function ensureAppointmentRow(id: string) {
  const found = await prisma.appointment.findUnique({ where: { id } });
  if (found) return found;

  const fromFile = getFileAppointment(id);
  if (!fromFile) return null;

  return prisma.appointment.create({
    data: {
      id: fromFile.id,
      createdAt: new Date(fromFile.createdAt),
      status: fromFile.status,
      fullName: fromFile.fullName,
      procedure: fromFile.procedure,
      dreamResult: fromFile.dreamResult,
      referencePhotoPath: fromFile.referencePhotoPath,
      hairHistoryOther: fromFile.hairHistoryOther,
      currentPhotoPath: fromFile.currentPhotoPath,
      preferredDates: fromFile.preferredDates,
      clientPhone: fromFile.clientPhone,
      adminNotes: fromFile.adminNotes,
      availableSlots: fromFile.availableSlots as unknown as Prisma.InputJsonValue,
      notifiedAt: fromFile.notifiedAt,
      confirmedSlot: fromFile.confirmedSlot,
      slotConfirmedAt: fromFile.slotConfirmedAt,
      slotAccepted: fromFile.slotAccepted,
      hairHistory: fromFile.hairHistory as unknown as Prisma.InputJsonValue,
      treatmentsDone: fromFile.treatmentsDone as unknown as Prisma.InputJsonValue,
      accountingEntries: fromFile.accountingEntries as unknown as Prisma.InputJsonValue,
      productsUsed: fromFile.productsUsed as unknown as Prisma.InputJsonValue,
      pushSubscriptions: fromFile.pushSubscriptions as unknown as Prisma.InputJsonValue,
      notificationLog: fromFile.notificationLog as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function ensureProductRow(id: string) {
  const found = await prisma.product.findUnique({ where: { id } });
  if (found) return found;

  const fromFile = getFileProduct(id);
  if (!fromFile) return null;

  return prisma.product.create({
    data: {
      id: fromFile.id,
      name: fromFile.name,
      brand: fromFile.brand,
      barcode: fromFile.barcode,
      category: fromFile.category,
      unit: fromFile.unit,
      stock: Math.trunc(Number(fromFile.stock) || 0),
      minStock: Math.trunc(Number(fromFile.minStock) || 0),
      costPrice: Number(fromFile.costPrice) || 0,
      salePrice: Number(fromFile.salePrice) || 0,
      createdAt: new Date(fromFile.createdAt),
    },
  });
}

export async function appendAccountingEntry(
  appointmentId: string,
  entry: { id?: string; service: string; amount: number; performedBy: string; performedAt: string; notes: string }
) {
  const appointment = await ensureAppointmentRow(appointmentId);
  if (!appointment) return null;

  const list = asArray<Record<string, unknown>>(appointment.accountingEntries);
  const safeEntry = {
    id: entry.id ?? randomUUID(),
    service: entry.service,
    amount: Number(entry.amount),
    performedBy: entry.performedBy,
    performedAt: entry.performedAt,
    notes: entry.notes,
  };

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { accountingEntries: [...list, safeEntry] as unknown as Prisma.InputJsonValue },
  });
}

export async function appendProductUse(
  appointmentId: string,
  entry: {
    id?: string;
    productId: string;
    productName: string;
    brand: string;
    quantity: number;
    unit: string;
    costPrice: number;
    salePrice: number;
    usedAt: string;
    usedBy: string;
  }
) {
  const appointment = await ensureAppointmentRow(appointmentId);
  if (!appointment) return null;

  const list = asArray<Record<string, unknown>>(appointment.productsUsed);
  const safeEntry = {
    id: entry.id ?? randomUUID(),
    productId: entry.productId,
    productName: entry.productName,
    brand: entry.brand,
    quantity: Number(entry.quantity),
    unit: entry.unit,
    costPrice: Number(entry.costPrice),
    salePrice: Number(entry.salePrice),
    usedAt: entry.usedAt,
    usedBy: entry.usedBy,
  };

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { productsUsed: [...list, safeEntry] as unknown as Prisma.InputJsonValue },
  });
}
