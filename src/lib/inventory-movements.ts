import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export type InventoryMovementType = 'sale' | 'return' | 'adjustment' | 'restock';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  unit: string;
  quantity: number;
  type: InventoryMovementType;
  reason: string;
  by: string;
  appointmentId: string;
  remainingStock: number;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'inventory-movements.json');

function readAll(): InventoryMovement[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as InventoryMovement[];
  } catch {
    return [];
  }
}

function writeAll(data: InventoryMovement[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function addInventoryMovement(
  input: Omit<InventoryMovement, 'id' | 'createdAt'>
): InventoryMovement {
  const all = readAll();
  const movement: InventoryMovement = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    productId: input.productId,
    productName: input.productName,
    barcode: input.barcode,
    unit: input.unit,
    quantity: Number(input.quantity) || 0,
    type: input.type,
    reason: input.reason,
    by: input.by,
    appointmentId: input.appointmentId,
    remainingStock: Number(input.remainingStock) || 0,
  };
  all.push(movement);
  writeAll(all);
  return movement;
}

export function getInventoryMovements(limit = 100): InventoryMovement[] {
  const all = readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return all.slice(0, Math.max(1, limit));
}
