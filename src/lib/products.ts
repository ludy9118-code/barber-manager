import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string; // e.g. 'queratina', 'tinte', 'shampoo', 'acondicionador', 'tratamiento', 'otro'
  unit: string;     // 'ml', 'g', 'unidad'
  stock: number;    // current units in stock
  minStock: number; // low-stock alert threshold
  costPrice: number;  // purchase cost per unit (in ARS)
  salePrice: number;  // price charged to client per unit (in ARS)
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');

function readAll(): Product[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

function writeAll(data: Product[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllProducts(): Product[] {
  return readAll();
}

export function getProductById(id: string): Product | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function getProductByBarcode(barcode: string): Product | null {
  if (!barcode.trim()) return null;
  return readAll().find((p) => p.barcode === barcode.trim()) ?? null;
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = readAll();
  const now = new Date().toISOString();
  const product: Product = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: data.name.trim(),
    brand: data.brand?.trim() ?? '',
    barcode: data.barcode?.trim() ?? '',
    category: data.category?.trim() ?? 'otro',
    unit: data.unit?.trim() ?? 'unidad',
    stock: Number(data.stock) || 0,
    minStock: Number(data.minStock) || 0,
    costPrice: Number(data.costPrice) || 0,
    salePrice: Number(data.salePrice) || 0,
  };
  products.push(product);
  writeAll(products);
  return product;
}

export function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
  const products = readAll();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
  writeAll(products);
  return products[idx];
}

export function adjustStock(id: string, delta: number): Product | null {
  const products = readAll();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx].stock = Math.max(0, products[idx].stock + delta);
  products[idx].updatedAt = new Date().toISOString();
  writeAll(products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = readAll();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeAll(filtered);
  return true;
}
