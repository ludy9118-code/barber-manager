import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { PDFParse } from 'pdf-parse';
import { randomUUID } from 'node:crypto';

const WORKSPACE_ROOT = process.cwd();
const PRODUCTS_FILE = path.join(WORKSPACE_ROOT, 'src', 'data', 'products.json');

function parseMoney(raw) {
  if (typeof raw !== 'string') return Number(raw) || 0;
  const cleaned = raw.replace(/[^0-9.,-]/g, '');
  if (!cleaned) return 0;

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  let normalized = cleaned;

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastDot > lastComma) {
      normalized = cleaned.replace(/,/g, '');
    } else {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function parseQuantity(raw) {
  if (typeof raw !== 'string') return Number(raw) || 0;
  const value = Number(raw.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function inferUnit(name) {
  const upper = name.toUpperCase();
  if (/\b\d+(?:[.,]\d+)?\s*ML\b/.test(upper)) return 'ml';
  if (/\b\d+(?:[.,]\d+)?\s*GR\b/.test(upper) || /\b\d+(?:[.,]\d+)?\s*G\b/.test(upper)) return 'g';
  if (/\b\d+(?:[.,]\d+)?\s*L\b/.test(upper)) return 'l';
  return 'unidad';
}

function inferCategory(name) {
  const upper = name.toUpperCase();
  if (upper.includes('SHAMPOO')) return 'shampoo';
  if (upper.includes('COND')) return 'acondicionador';
  if (upper.includes('MASK') || upper.includes('PLEX') || upper.includes('TREAT')) return 'tratamiento';
  if (upper.includes('COLOR') || upper.includes('ME+')) return 'tinte';
  if (upper.includes('POWDER') || upper.includes('BLONDOR')) return 'decolorante';
  if (upper.includes('OXON')) return 'oxidante';
  return 'otro';
}

function inferBrand(name) {
  const upper = name.toUpperCase();
  if (upper.startsWith('WP ') || upper.includes('WELLA')) return 'Wella Professionals';
  if (upper.startsWith('KP ')) return 'Koleston Perfect';
  if (upper.startsWith('ILLUMINA')) return 'Illumina';
  if (upper.startsWith('BLONDOR')) return 'Blondor';
  if (upper.startsWith('WELLOXON')) return 'Welloxon';
  return '';
}

function parseCatalogRows(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];
  const rowRegex = /^([A-Z0-9]+)\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+\$([\d.,]+)\s+(\d+(?:[.,]\d+)?)%\s+\$([\d.,]+)\s+(\d+(?:[.,]\d+)?)%\s+\$([\d.,]+)\s+\$([\d.,]+)\s+\$([\d.,]+)$/;

  for (const line of lines) {
    const match = line.match(rowRegex);
    if (!match) continue;

    const [, code, rawName, rawQty, rawPrice, , rawPreDiscount, , rawUnitWithTax] = match;
    const name = rawName.replace(/\s+/g, ' ').trim();
    const quantity = parseQuantity(rawQty);
    const listPrice = parseMoney(rawPrice);
    const costPrice = parseMoney(rawPreDiscount);
    const salePrice = parseMoney(rawUnitWithTax);

    if (!code || !name || salePrice <= 0) continue;

    rows.push({
      code,
      name,
      quantity,
      listPrice,
      costPrice: costPrice > 0 ? costPrice : listPrice,
      salePrice,
      unit: inferUnit(name),
      category: inferCategory(name),
      brand: inferBrand(name),
    });
  }

  return rows;
}

async function loadProducts() {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, `${JSON.stringify(products, null, 2)}\n`, 'utf-8');
}

async function extractTextFromPdf(pdfPath) {
  const pdfBuffer = await fs.readFile(pdfPath);
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
}

function mergeCatalog(existingProducts, rows) {
  const now = new Date().toISOString();
  const byBarcode = new Map(existingProducts.map((p) => [String(p.barcode || '').trim(), p]));

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const found = byBarcode.get(row.code);
    if (found) {
      found.name = row.name;
      found.brand = row.brand;
      found.category = row.category;
      found.unit = row.unit;
      found.costPrice = row.costPrice;
      found.salePrice = row.salePrice;
      found.stock = Number(found.stock || 0) + row.quantity;
      found.updatedAt = now;
      updated += 1;
      continue;
    }

    existingProducts.push({
      id: randomUUID(),
      name: row.name,
      brand: row.brand,
      barcode: row.code,
      category: row.category,
      unit: row.unit,
      stock: row.quantity,
      minStock: 1,
      costPrice: row.costPrice,
      salePrice: row.salePrice,
      createdAt: now,
      updatedAt: now,
    });
    created += 1;
  }

  return { created, updated };
}

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error('Uso: npm run import:catalog -- "C:/ruta/catalogo.pdf"');
    process.exit(1);
  }

  const resolved = path.resolve(pdfPath);
  const text = await extractTextFromPdf(resolved);
  const rows = parseCatalogRows(text);

  if (rows.length === 0) {
    console.error('No se encontraron filas de catalogo validas en el PDF.');
    process.exit(1);
  }

  const products = await loadProducts();
  const { created, updated } = mergeCatalog(products, rows);
  await saveProducts(products);

  console.log(`Catalogo importado desde: ${resolved}`);
  console.log(`Filas detectadas: ${rows.length}`);
  console.log(`Productos nuevos: ${created}`);
  console.log(`Productos actualizados: ${updated}`);
  console.log(`Total inventario: ${products.length}`);
}

main().catch((error) => {
  console.error('Error importando catalogo:', error);
  process.exit(1);
});
