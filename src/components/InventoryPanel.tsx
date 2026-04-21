'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const BarcodeScanner = dynamic(() => import('./BarcodeScanner'), { ssr: false });

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
}

const PALETTE = {
  dark: '#5C3D35',
  mid: '#7A5C52',
  soft: '#9D7B6F',
  gold: '#C4A882',
  cream: '#F4E8DC',
  bg: '#FBF6F0',
};

const CATEGORIES = ['queratina', 'tinte', 'shampoo', 'acondicionador', 'tratamiento', 'otro'];
const UNITS = ['ml', 'g', 'unidad', 'oz', 'kg', 'L'];

function Inp({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>{label}</p>
      <input
        className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
        style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)', background: '#fff' }}
        {...props}
      />
    </div>
  );
}

function Sel({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>{label}</p>
      <select
        className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
        style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)', background: '#fff' }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

interface InventoryPanelProps {
  adminKey: string;
}

const EMPTY_FORM = {
  name: '', brand: '', barcode: '', category: 'otro', unit: 'unidad',
  stock: '', minStock: '', costPrice: '', salePrice: '',
};

export default function InventoryPanel({ adminKey }: InventoryPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Add/Edit modal
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Barcode scanner
  const [showScanner, setShowScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // Stock adjust
  const [stockModal, setStockModal] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState('');
  const [stockNote, setStockNote] = useState<'add' | 'remove'>('add');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/products', { headers: { 'x-admin-key': adminKey } });
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }, [adminKey]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setShowScanner(false);
    setManualBarcode('');
    setFormError('');
    setModal('add');
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, brand: p.brand, barcode: p.barcode, category: p.category,
      unit: p.unit, stock: String(p.stock), minStock: String(p.minStock),
      costPrice: String(p.costPrice), salePrice: String(p.salePrice),
    });
    setEditTarget(p);
    setFormError('');
    setModal('edit');
  };

  const handleBarcodeScan = async (code: string) => {
    setShowScanner(false);
    setManualBarcode(code);
    setForm((f) => ({ ...f, barcode: code }));
    // Try to look up if product already exists
    const res = await fetch(`/api/products?barcode=${encodeURIComponent(code)}`, {
      headers: { 'x-admin-key': adminKey },
    });
    if (res.ok) {
      const existing: Product = await res.json();
      openEdit(existing);
    }
  };

  const handleManualBarcodeBlur = async () => {
    if (!manualBarcode.trim()) return;
    setForm((f) => ({ ...f, barcode: manualBarcode.trim() }));
    const res = await fetch(`/api/products?barcode=${encodeURIComponent(manualBarcode.trim())}`, {
      headers: { 'x-admin-key': adminKey },
    });
    if (res.ok) {
      const existing: Product = await res.json();
      openEdit(existing);
    }
  };

  const saveProduct = async () => {
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setFormError('');
    const body = {
      ...form,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
      costPrice: Number(form.costPrice) || 0,
      salePrice: Number(form.salePrice) || 0,
    };

    let res: Response;
    if (modal === 'edit' && editTarget) {
      res = await fetch(`/api/products/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setFormError(err.error ?? 'Error al guardar.');
    } else {
      setModal(null);
      await fetchProducts();
    }
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto del inventario?')) return;
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
    await fetchProducts();
  };

  const adjustStock = async () => {
    if (!stockModal) return;
    const delta = Number(stockDelta);
    if (!delta || delta <= 0) return;
    const newStock = stockNote === 'add' ? stockModal.stock + delta : Math.max(0, stockModal.stock - delta);
    await fetch(`/api/products/${stockModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ stock: newStock }),
    });
    setStockModal(null);
    setStockDelta('');
    await fetchProducts();
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.barcode.includes(q);
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const lowStock = products.filter((p) => p.minStock > 0 && p.stock <= p.minStock);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-light" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
            Inventario de productos
          </h2>
          <p className="text-xs mt-0.5" style={{ color: PALETTE.soft }}>
            {products.length} productos registrados
            {lowStock.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-white text-[10px]" style={{ background: '#A84444' }}>
                ⚠️ {lowStock.length} con stock bajo
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowScanner(true); setManualBarcode(''); setModal('add'); setForm({ ...EMPTY_FORM }); }}
            className="px-3 py-2 rounded-lg text-xs border flex items-center gap-1.5"
            style={{ borderColor: PALETTE.gold, color: PALETTE.mid, background: '#fff' }}
          >
            📷 Escanear
          </button>
          <button onClick={openAdd}
            className="px-4 py-2 rounded-lg text-xs text-white font-medium"
            style={{ background: `linear-gradient(135deg, ${PALETTE.mid}, ${PALETTE.gold})` }}>
            + Agregar producto
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: '#FAE8E8', border: '1px solid #F5C6C6' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#A84444' }}>⚠️ Productos con stock bajo</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: '#fff', color: '#A84444', border: '1px solid #F5C6C6' }}>
                {p.name} — {p.stock} {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar por nombre, marca o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm outline-none"
          style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)', background: '#fff' }}
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm outline-none"
          style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)', background: '#fff' }}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Product list */}
      {loading ? (
        <p className="text-center py-8 opacity-40" style={{ color: PALETTE.dark }}>Cargando inventario...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: `1px solid ${PALETTE.cream}` }}>
          <p className="text-sm opacity-50" style={{ color: PALETTE.dark }}>
            {products.length === 0 ? 'No hay productos registrados. Agregá el primero.' : 'No se encontraron productos con esos filtros.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${PALETTE.cream}` }}>
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] px-4 py-2 text-[10px] uppercase tracking-widest"
            style={{ background: PALETTE.dark, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-poppins)' }}>
            <span>Producto</span>
            <span>Código</span>
            <span>Stock</span>
            <span>Costo</span>
            <span>Precio</span>
            <span>Acciones</span>
          </div>

          <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
            {filtered.map((p) => {
              const isLow = p.minStock > 0 && p.stock <= p.minStock;
              return (
                <div key={p.id} className="px-4 py-3 grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  {/* Name + brand */}
                  <div>
                    <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>{p.name}</p>
                    <p className="text-xs opacity-60" style={{ color: PALETTE.dark }}>{p.brand} · <span className="capitalize">{p.category}</span></p>
                  </div>

                  {/* Barcode */}
                  <p className="text-xs font-mono" style={{ color: PALETTE.soft }}>{p.barcode || '—'}</p>

                  {/* Stock */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: isLow ? '#A84444' : '#4E7A59' }}
                    >
                      {p.stock}
                    </span>
                    <span className="text-xs opacity-60" style={{ color: PALETTE.dark }}>{p.unit}</span>
                    {isLow && <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full" style={{ background: '#A84444' }}>bajo</span>}
                  </div>

                  {/* Cost */}
                  <p className="text-xs" style={{ color: PALETTE.soft }}>${p.costPrice.toLocaleString('es-AR')}</p>

                  {/* Sale price */}
                  <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>${p.salePrice.toLocaleString('es-AR')}</p>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setStockModal(p)}
                      className="text-[11px] px-2 py-1 rounded-lg border"
                      style={{ borderColor: PALETTE.gold, color: PALETTE.mid, background: '#fff' }}
                    >
                      Stock
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="text-[11px] px-2 py-1 rounded-lg border"
                      style={{ borderColor: PALETTE.gold, color: PALETTE.mid, background: '#fff' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-[11px] px-2 py-1 rounded-lg border"
                      style={{ borderColor: '#F5C6C6', color: '#A84444', background: '#FAE8E8' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: Add / Edit product ──────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-y-auto max-h-[92vh]"
            style={{ background: '#fff', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}>
            {/* Header */}
            <div className="sticky top-0 px-5 pt-5 pb-4 border-b" style={{ background: '#fff', borderColor: PALETTE.cream }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-light italic" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
                  {modal === 'edit' ? 'Editar producto' : 'Nuevo producto'}
                </h3>
                <button onClick={() => setModal(null)} className="text-xl opacity-40 hover:opacity-70" style={{ color: PALETTE.dark }}>✕</button>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Barcode scanner section */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Código de barras</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ingresá o escaneá el código"
                    value={manualBarcode || form.barcode}
                    onChange={(e) => { setManualBarcode(e.target.value); setForm((f) => ({ ...f, barcode: e.target.value })); }}
                    onBlur={handleManualBarcodeBlur}
                    className="flex-1 px-3 py-2.5 border rounded-lg text-sm outline-none font-mono"
                    style={{ borderColor: PALETTE.gold, color: PALETTE.dark, background: '#fff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: PALETTE.gold, color: PALETTE.mid, background: showScanner ? PALETTE.cream : '#fff' }}
                  >
                    📷
                  </button>
                </div>
                {showScanner && (
                  <BarcodeScanner onDetected={handleBarcodeScan} onClose={() => setShowScanner(false)} />
                )}
              </div>

              <Inp label="Nombre del producto *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Keratina Brasileña Argan" />
              <Inp label="Marca" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Ej: BTX, Inoar, Loreal..." />

              <div className="grid grid-cols-2 gap-3">
                <Sel label="Categoría" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </Sel>
                <Sel label="Unidad" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </Sel>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Inp label="Stock actual" type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="0" />
                <Inp label="Stock mínimo (alerta)" type="number" min="0" value={form.minStock} onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))} placeholder="0" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Inp label="Precio de costo ($)" type="number" min="0" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))} placeholder="0" />
                <Inp label="Precio al cliente ($)" type="number" min="0" value={form.salePrice} onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))} placeholder="0" />
              </div>

              {form.costPrice && form.salePrice && Number(form.costPrice) > 0 && (
                <div className="rounded-xl p-3 text-center" style={{ background: '#EAF4ED', border: '1px solid #C8E6C9' }}>
                  <p className="text-xs" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>
                    Margen: ${(Number(form.salePrice) - Number(form.costPrice)).toLocaleString('es-AR')} ·{' '}
                    {Math.round(((Number(form.salePrice) - Number(form.costPrice)) / Number(form.costPrice)) * 100)}%
                  </p>
                </div>
              )}

              {formError && <p className="text-sm" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)' }}>{formError}</p>}

              <div className="flex gap-3 pb-2">
                <button onClick={() => setModal(null)}
                  className="flex-1 py-3 rounded-xl border text-sm"
                  style={{ borderColor: PALETTE.gold, color: PALETTE.soft }}>
                  Cancelar
                </button>
                <button onClick={saveProduct} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${PALETTE.mid}, ${PALETTE.gold})` }}>
                  {saving ? 'Guardando...' : modal === 'edit' ? 'Guardar cambios' : 'Agregar al inventario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Adjust stock ──────────────────────────────────────── */}
      {stockModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-5 shadow-2xl" style={{ background: '#fff' }}>
            <h3 className="text-base font-light italic mb-1" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
              Ajustar stock
            </h3>
            <p className="text-sm mb-4 opacity-70" style={{ color: PALETTE.dark }}>{stockModal.name} · actual: <strong>{stockModal.stock} {stockModal.unit}</strong></p>

            <div className="flex gap-2 mb-4">
              {(['add', 'remove'] as const).map((o) => (
                <button key={o} onClick={() => setStockNote(o)}
                  className="flex-1 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: stockNote === o ? PALETTE.dark : PALETTE.gold,
                    background: stockNote === o ? PALETTE.dark : '#fff',
                    color: stockNote === o ? '#fff' : PALETTE.soft,
                  }}>
                  {o === 'add' ? '+ Ingreso' : '− Salida'}
                </button>
              ))}
            </div>

            <Inp
              label={`Cantidad a ${stockNote === 'add' ? 'agregar' : 'descontar'} (${stockModal.unit})`}
              type="number" min="1" value={stockDelta}
              onChange={(e) => setStockDelta(e.target.value)}
              placeholder="0"
            />

            {stockDelta && Number(stockDelta) > 0 && (
              <p className="text-xs mt-2 text-center" style={{ color: PALETTE.mid }}>
                Nuevo stock: {stockNote === 'add' ? stockModal.stock + Number(stockDelta) : Math.max(0, stockModal.stock - Number(stockDelta))} {stockModal.unit}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => { setStockModal(null); setStockDelta(''); }}
                className="flex-1 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: PALETTE.gold, color: PALETTE.soft }}>
                Cancelar
              </button>
              <button onClick={adjustStock} disabled={!stockDelta || Number(stockDelta) <= 0}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${PALETTE.mid}, ${PALETTE.gold})` }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
