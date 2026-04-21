'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────
interface Appointment {
  id: string;
  fullName: string;
  clientPhone: string;
  procedure: string;
  status: 'pending' | 'accepted' | 'rejected';
  confirmedSlot: string;
  slotAccepted: boolean | null;
  createdAt: string;
  accountingEntries: Array<{ amount: number; performedAt: string }>;
  productsUsed: Array<{ quantity: number; salePrice: number; costPrice: number; usedAt: string }>;
}

interface CartProduct {
  cartId: string;
  productId: string;
  productName: string;
  brand: string;
  unit: string;
  salePrice: number;
  quantity: number;
  stockAvailable: number;
}

interface CartService {
  cartId: string;
  service: string;
  amount: number;
  notes: string;
}

interface InventoryProduct {
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
}

interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  unit: string;
  quantity: number;
  type: 'sale' | 'return' | 'adjustment' | 'restock';
  reason: string;
  by: string;
  appointmentId: string;
  remainingStock: number;
  createdAt: string;
}

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  dark: '#5C3D35', mid: '#7A5C52', soft: '#9D7B6F',
  gold: '#C4A882', cream: '#F4E8DC', bg: '#FBF6F0',
};

const STATUS_LABEL = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada' };
const STATUS_COLOR = { pending: '#B5862A', accepted: '#2E5E38', rejected: '#A84444' };
const STATUS_BG    = { pending: '#FBF3E0', accepted: '#EAF4ED', rejected: '#FAE8E8' };

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState(false);
  const [tab, setTab] = useState<'citas' | 'caja' | 'inventario' | 'resumen'>('citas');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [expandedAppt, setExpandedAppt] = useState<string | null>(null);
  const [apptSearch, setApptSearch] = useState('');

  // Slot modal
  const [slotModal, setSlotModal] = useState<{ id: string; name: string } | null>(null);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [slotSending, setSlotSending] = useState(false);
  const [slotResult, setSlotResult] = useState('');

  // Register state
  const [regApptId, setRegApptId] = useState('');
  const [regProfessional, setRegProfessional] = useState('');
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [services, setServices] = useState<CartService[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Add service modal
  const [svcModal, setSvcModal] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcAmount, setSvcAmount] = useState('');
  const [svcNotes, setSvcNotes] = useState('');

  // Checkout
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ apptId: string } | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAppts(true);
    const res = await fetch('/api/appointments', { headers: { 'x-admin-key': key } });
    if (!res.ok) { setAuthErr(true); setLoadingAppts(false); return; }
    setAppointments(await res.json());
    await refreshInventory();
    setAuthed(true);
    setLoadingAppts(false);
  };

  const refreshAppts = async () => {
    const res = await fetch('/api/appointments', { headers: { 'x-admin-key': key } });
    if (res.ok) setAppointments(await res.json());
  };

  const refreshInventory = async () => {
    if (!key) return;
    setInventoryLoading(true);
    const res = await fetch('/api/products', { headers: { 'x-admin-key': key } }).catch(() => null);
    if (res?.ok) {
      const products = await res.json() as InventoryProduct[];
      setInventory(products);
    }
    setInventoryLoading(false);
  };

  const refreshMovements = async () => {
    if (!key) return;
    setMovementsLoading(true);
    const res = await fetch('/api/inventory/movements?limit=30', {
      headers: { 'x-admin-key': key },
    }).catch(() => null);
    if (res?.ok) {
      const items = await res.json() as InventoryMovement[];
      setMovements(items);
    }
    setMovementsLoading(false);
  };

  const addInventoryItemToCart = (p: InventoryProduct) => {
    setScanError('');
    if (p.stock <= 0) {
      setScanError(`Sin stock: ${p.name}`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) {
          setScanError(`Stock maximo alcanzado para ${p.name} (${p.stock} ${p.unit}).`);
          return prev;
        }
        return prev.map((c) => c.productId === p.id ? { ...c, quantity: c.quantity + 1, stockAvailable: p.stock } : c);
      }

      return [...prev, {
        cartId: crypto.randomUUID(),
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        unit: p.unit,
        salePrice: p.salePrice,
        quantity: 1,
        stockAvailable: p.stock,
      }];
    });
  };

  // ── Send slot ────────────────────────────────────────────────────────────────
  const handleSendSlot = async () => {
    if (!slotModal || !slotDate || !slotTime) return;
    setSlotSending(true);
    const dt = new Date(`${slotDate}T${slotTime}`);
    const label = dt.toLocaleString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    await fetch(`/api/appointments/${slotModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ availableSlots: [label], notifiedAt: new Date().toISOString(), status: 'accepted' }),
    });
    const pushRes = await fetch('/api/notifications/send-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ appointmentId: slotModal.id, slot: label }),
    });
    const pj = await pushRes.json();
    setSlotResult(pj.pushed ? 'Notificacion enviada' : 'Turno guardado (sin push activo)');
    await refreshAppts();
    setSlotSending(false);
    setTimeout(() => { setSlotModal(null); setSlotDate(''); setSlotTime(''); setSlotResult(''); }, 2000);
  };

  // ── Barcode scan ─────────────────────────────────────────────────────────────
  const handleBarcode = async (barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;
    setScanning(false);
    setScanLoading(true);
    setScanError('');
    try {
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(cleanBarcode)}`, {
        headers: { 'x-admin-key': key },
      });
      if (!res.ok) { setScanError(`Producto no encontrado (${cleanBarcode})`); setScanLoading(false); return; }
      const p = await res.json() as InventoryProduct;
      addInventoryItemToCart(p);
      setManualBarcode('');
    } catch {
      setScanError('Error al buscar el producto.');
    }
    setScanLoading(false);
  };

  // ── Checkout ─────────────────────────────────────────────────────────────────
  const cartTotal = cart.reduce((s, c) => s + c.salePrice * c.quantity, 0);
  const svcTotal = services.reduce((s, sv) => s + sv.amount, 0);
  const grandTotal = cartTotal + svcTotal;

  const handleCheckout = async () => {
    if (cart.length === 0 && services.length === 0) return;
    if (!regApptId) {
      setCheckoutError('Selecciona un cliente para generar factura y registrar el consumo en su tratamiento.');
      return;
    }
    if (!regProfessional.trim()) {
      setCheckoutError('Ingresa el nombre del profesional.');
      return;
    }

    setCheckoutError('');
    setSaving(true);

    const apptId = regApptId || null;
    const errors: string[] = [];

    // 1. Save products (deducts stock)
    for (const item of cart) {
      if (apptId) {
        // Linked to appointment: uses the products endpoint which deducts stock
        const res = await fetch(`/api/appointments/${apptId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            usedBy: regProfessional.trim(),
          }),
        }).catch(() => null);

        if (!res?.ok) {
          const err = await res?.json().catch(() => ({}));
          errors.push(err?.error ?? `No se pudo descontar ${item.productName}.`);
        }
      } else {
        // Anonymous sale: deduct stock directly
        const res = await fetch(`/api/products/${item.productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
          body: JSON.stringify({ stockAdjust: -item.quantity }),
        }).catch(() => null);

        if (!res?.ok) {
          errors.push(`No se pudo descontar ${item.productName}.`);
        }
      }
    }

    // 2. Save services (accounting entries)
    if (apptId) {
      for (const sv of services) {
        const res = await fetch(`/api/appointments/${apptId}/accounting`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
          body: JSON.stringify({
            service: sv.service,
            amount: sv.amount,
            performedBy: regProfessional.trim(),
            notes: sv.notes,
          }),
        }).catch(() => null);

        if (!res?.ok) {
          const err = await res?.json().catch(() => ({}));
          errors.push(err?.error ?? `No se pudo guardar el servicio ${sv.service}.`);
        }
      }
    }

    if (errors.length > 0) {
      setCheckoutError(errors[0]);
      setSaving(false);
      return;
    }

    setSaved({ apptId: apptId ?? '' });
    setCart([]);
    setServices([]);
    setSaving(false);
    await refreshInventory();
    await refreshMovements();
    await refreshAppts();
  };

  // ── Render: Auth gate ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: P.bg }}>
        <div className="w-full max-w-xs">
          <p className="text-xs uppercase tracking-widest mb-1 text-center" style={{ color: P.soft }}>Color Studio</p>
          <h1 className="text-3xl font-light italic text-center mb-8" style={{ color: P.dark, fontFamily: 'var(--font-playfair)' }}>Profesional</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Clave de acceso"
              value={key}
              onChange={(e) => { setKey(e.target.value); setAuthErr(false); }}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: authErr ? '#A84444' : P.gold, color: P.dark, background: '#fff', fontFamily: 'var(--font-poppins)' }}
            />
            {authErr && <p className="text-xs text-center" style={{ color: '#A84444' }}>Clave incorrecta</p>}
            <button
              type="submit"
              disabled={loadingAppts || !key}
              className="w-full py-3 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ background: P.dark, fontFamily: 'var(--font-poppins)' }}
            >
              {loadingAppts ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Filtered appointments ──────────────────────────────────────────────────
  const filteredAppts = appointments.filter((a) =>
    !apptSearch.trim() ||
    a.fullName.toLowerCase().includes(apptSearch.toLowerCase()) ||
    a.clientPhone.includes(apptSearch)
  );

  const inventoryFiltered = inventory.filter((p) => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q)
      || p.brand.toLowerCase().includes(q)
      || p.barcode.toLowerCase().includes(q);
  });

  const totalStockUnits = inventory.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const totalStockCost = inventory.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.costPrice || 0)), 0);
  const totalStockSale = inventory.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.salePrice || 0)), 0);
  const reservedUnitsInCart = cart.reduce((sum, p) => sum + p.quantity, 0);

  const purchaseSuggestions = inventory
    .filter((p) => p.stock <= Math.max(0, Number(p.minStock || 0)))
    .map((p) => {
      const target = Math.max(5, (Number(p.minStock) || 0) * 2);
      return {
        ...p,
        suggestedQty: Math.max(1, target - Number(p.stock || 0)),
      };
    })
    .sort((a, b) => a.stock - b.stock);

  const movementLabel: Record<InventoryMovement['type'], string> = {
    sale: 'Salida por venta',
    return: 'Entrada por devolucion',
    adjustment: 'Ajuste manual',
    restock: 'Entrada por compra',
  };

  const dayKeyFromDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const dailyMap = new Map<string, {
    services: number;
    productsRevenue: number;
    productsCost: number;
    operations: number;
  }>();

  for (const appt of appointments) {
    for (const entry of appt.accountingEntries ?? []) {
      const key = dayKeyFromDate(entry.performedAt);
      if (!key) continue;
      const curr = dailyMap.get(key) ?? { services: 0, productsRevenue: 0, productsCost: 0, operations: 0 };
      curr.services += Number(entry.amount) || 0;
      curr.operations += 1;
      dailyMap.set(key, curr);
    }

    for (const product of appt.productsUsed ?? []) {
      const key = dayKeyFromDate(product.usedAt);
      if (!key) continue;
      const qty = Number(product.quantity) || 0;
      const curr = dailyMap.get(key) ?? { services: 0, productsRevenue: 0, productsCost: 0, operations: 0 };
      curr.productsRevenue += (Number(product.salePrice) || 0) * qty;
      curr.productsCost += (Number(product.costPrice) || 0) * qty;
      curr.operations += 1;
      dailyMap.set(key, curr);
    }
  }

  const today = new Date();
  const dayKeys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dayKeys.push(dayKeyFromDate(d.toISOString()));
  }

  const dailyRows = dayKeys.map((key) => {
    const data = dailyMap.get(key) ?? { services: 0, productsRevenue: 0, productsCost: 0, operations: 0 };
    const revenue = data.services + data.productsRevenue;
    const profit = revenue - data.productsCost;
    return {
      key,
      services: data.services,
      productsRevenue: data.productsRevenue,
      productsCost: data.productsCost,
      revenue,
      profit,
      operations: data.operations,
    };
  });

  const todayRow = dailyRows[0];
  const yesterdayRow = dailyRows[1] ?? { revenue: 0, profit: 0, services: 0, productsRevenue: 0, productsCost: 0, operations: 0, key: '' };
  const diffRevenue = todayRow.revenue - yesterdayRow.revenue;
  const trendLabel = diffRevenue > 0
    ? `Hoy subiste ${diffRevenue.toLocaleString('es-AR')} vs ayer.`
    : diffRevenue < 0
      ? `Hoy bajaste ${Math.abs(diffRevenue).toLocaleString('es-AR')} vs ayer.`
      : 'Hoy estas igual que ayer.';
  const trendColor = diffRevenue > 0 ? '#2E5E38' : diffRevenue < 0 ? '#A84444' : P.soft;

  // ── Render: Main app ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, maxWidth: '600px', margin: '0 auto' }}>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-safe" style={{ background: P.dark }}>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,247,236,0.5)' }}>Color Studio</p>
            <p className="text-base font-light italic" style={{ color: '#FFF7EC', fontFamily: 'var(--font-playfair)' }}>Gustavo Pro</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(255,247,236,0.2)' }}>
            {(['citas', 'caja', 'inventario', 'resumen'] as const).map((t) => (
              <button key={t} onClick={() => {
                setTab(t);
                if (t === 'caja' || t === 'inventario') {
                  void refreshInventory();
                }
                if (t === 'inventario') {
                  void refreshMovements();
                }
              }}
                className="px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition"
                style={{
                  background: tab === t ? 'rgba(255,247,236,0.15)' : 'transparent',
                  color: tab === t ? '#FFF7EC' : 'rgba(255,247,236,0.5)',
                }}>
                {t === 'citas' ? 'Citas' : t === 'caja' ? 'Caja' : t === 'inventario' ? 'Inventario' : 'Resumen'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-safe">

        {/* ═══════════════════════════════════════════════════════════════
            TAB: CITAS
        ═══════════════════════════════════════════════════════════════ */}
        {tab === 'citas' && (
          <div className="px-4 py-5 space-y-3">
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={apptSearch}
              onChange={(e) => setApptSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: P.cream, background: '#fff', color: P.dark, fontFamily: 'var(--font-poppins)' }}
            />

            {filteredAppts.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: P.soft }}>Sin citas</p>
            )}

            {filteredAppts.map((a) => (
              <div key={a.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
                <button
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => setExpandedAppt(expandedAppt === a.id ? null : a.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: P.dark }}>{a.fullName}</p>
                    <p className="text-xs mt-0.5" style={{ color: P.soft }}>{a.clientPhone} · {a.procedure}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0"
                    style={{ background: STATUS_BG[a.status], color: STATUS_COLOR[a.status] }}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </button>

                {expandedAppt === a.id && (
                  <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: P.cream }}>
                    {a.confirmedSlot && (
                      <p className="text-xs" style={{ color: P.soft }}>
                        Turno: <span style={{ color: P.dark }}>{a.confirmedSlot}</span>
                        {a.slotAccepted === true && <span style={{ color: '#2E5E38' }}> — Confirmado</span>}
                        {a.slotAccepted === false && <span style={{ color: '#A84444' }}> — Rechazado</span>}
                      </p>
                    )}
                    <p className="text-xs" style={{ color: P.soft }}>
                      Solicitado: {new Date(a.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => { setSlotModal({ id: a.id, name: a.fullName }); setSlotDate(''); setSlotTime(''); setSlotResult(''); }}
                        className="text-xs px-4 py-2 rounded-xl border font-medium min-h-[40px]"
                        style={{ color: P.mid, borderColor: P.gold, background: '#fff' }}>
                        Enviar turno
                      </button>
                      <button
                        onClick={() => { setRegApptId(a.id); setTab('caja'); }}
                        className="text-xs px-4 py-2 rounded-xl font-medium min-h-[40px] text-white"
                        style={{ background: P.dark }}>
                        Abrir en caja
                      </button>
                      <a
                        href={`/factura/${a.id}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-4 py-2 rounded-xl border font-medium min-h-[40px] flex items-center"
                        style={{ color: P.soft, borderColor: P.cream }}>
                        Ver factura
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: CAJA
        ═══════════════════════════════════════════════════════════════ */}
        {tab === 'caja' && (
          <div className="px-4 py-5 space-y-4">

            {/* ── Client selector ── */}
            <div className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: P.soft }}>Cliente (opcional)</p>
              <select
                value={regApptId}
                onChange={(e) => setRegApptId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: P.gold, color: P.dark, background: '#fff', fontFamily: 'var(--font-poppins)' }}
              >
                <option value="">Sin cliente / Venta directa</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>{a.fullName} · {a.clientPhone}</option>
                ))}
              </select>
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: P.soft }}>Profesional</p>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={regProfessional}
                  onChange={(e) => setRegProfessional(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: P.gold, color: P.dark, background: '#fff', fontFamily: 'var(--font-poppins)' }}
                />
              </div>
            </div>

            {/* ── Scanner ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <div className="px-4 pt-4 pb-3">
                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: P.soft }}>Escanear producto</p>
                {!scanning ? (
                  <button
                    onClick={() => { setScanning(true); setScanError(''); }}
                    className="w-full py-3 rounded-xl text-white text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #2E5E38, #4E8C5E)' }}
                  >
                    Activar camara y escanear
                  </button>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Codigo de barras manual"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleBarcode(manualBarcode);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ borderColor: P.gold, color: P.dark, background: '#fff', fontFamily: 'var(--font-poppins)' }}
                  />
                  <button
                    onClick={() => void handleBarcode(manualBarcode)}
                    className="px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ background: P.dark, color: '#fff' }}
                  >
                    Agregar
                  </button>
                </div>
                {scanLoading && <p className="text-sm text-center py-2" style={{ color: P.soft }}>Buscando producto...</p>}
                {scanError && (
                  <div className="mt-2 px-3 py-2 rounded-xl text-sm" style={{ background: '#FAE8E8', color: '#A84444' }}>
                    {scanError}
                  </div>
                )}
              </div>
              {scanning && (
                <BarcodeScanner
                  onDetected={handleBarcode}
                  onClose={() => setScanning(false)}
                />
              )}
            </div>

            {/* ── Cart items ── */}
            {cart.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Productos escaneados</p>
                </div>
                <div className="divide-y" style={{ borderColor: P.cream }}>
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: P.dark }}>{item.productName}</p>
                        <p className="text-xs mt-0.5" style={{ color: P.soft }}>{item.brand} · ${item.salePrice.toLocaleString('es-AR')} c/u · stock {item.stockAvailable}</p>
                      </div>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCart((prev) => item.quantity <= 1 ? prev.filter((c) => c.cartId !== item.cartId) : prev.map((c) => c.cartId === item.cartId ? { ...c, quantity: c.quantity - 1 } : c))}
                          className="w-7 h-7 rounded-full border text-sm font-bold flex items-center justify-center"
                          style={{ borderColor: P.gold, color: P.mid }}>−</button>
                        <span className="text-sm font-medium w-6 text-center" style={{ color: P.dark }}>{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity >= item.stockAvailable) {
                              setScanError(`No hay mas stock para ${item.productName}.`);
                              return;
                            }
                            setCart((prev) => prev.map((c) => c.cartId === item.cartId ? { ...c, quantity: c.quantity + 1 } : c));
                          }}
                          className="w-7 h-7 rounded-full border text-sm font-bold flex items-center justify-center"
                          style={{ borderColor: P.gold, color: P.mid }}>+</button>
                      </div>
                      <p className="text-sm font-semibold w-20 text-right" style={{ color: '#2E5E38' }}>
                        ${(item.salePrice * item.quantity).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-right border-t" style={{ borderColor: P.cream, background: '#FAFAFA' }}>
                  <span className="text-xs" style={{ color: P.soft }}>Subtotal productos: </span>
                  <span className="text-sm font-semibold" style={{ color: P.dark }}>${cartTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>
            )}

            {/* ── Services / Labor ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Servicios / mano de obra</p>
                <button
                  onClick={() => { setSvcModal(true); setSvcName(''); setSvcAmount(''); setSvcNotes(''); }}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                  style={{ borderColor: P.gold, color: P.mid }}>
                  + Agregar
                </button>
              </div>
              {services.length === 0 && (
                <p className="px-4 pb-3 text-xs" style={{ color: P.soft }}>Sin servicios aún</p>
              )}
              {services.length > 0 && (
                <>
                  <div className="divide-y" style={{ borderColor: P.cream }}>
                    {services.map((sv) => (
                      <div key={sv.cartId} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: P.dark }}>{sv.service}</p>
                          {sv.notes && <p className="text-xs mt-0.5" style={{ color: P.soft }}>{sv.notes}</p>}
                        </div>
                        <p className="text-sm font-semibold" style={{ color: '#2E5E38' }}>${sv.amount.toLocaleString('es-AR')}</p>
                        <button
                          onClick={() => setServices((prev) => prev.filter((s) => s.cartId !== sv.cartId))}
                          className="text-xs w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: '#FAE8E8', color: '#A84444' }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-right border-t" style={{ borderColor: P.cream, background: '#FAFAFA' }}>
                    <span className="text-xs" style={{ color: P.soft }}>Subtotal servicios: </span>
                    <span className="text-sm font-semibold" style={{ color: P.dark }}>${svcTotal.toLocaleString('es-AR')}</span>
                  </div>
                </>
              )}
            </div>

            {/* ── Total + Checkout ── */}
            {(cart.length > 0 || services.length > 0) && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: P.dark }}>
                {checkoutError && (
                  <div className="px-3 py-2 rounded-xl text-sm" style={{ background: '#FAE8E8', color: '#A84444' }}>
                    {checkoutError}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,247,236,0.5)' }}>Total a cobrar</p>
                  <p className="text-3xl font-light" style={{ color: '#FFF7EC', fontFamily: 'var(--font-playfair)' }}>
                    ${grandTotal.toLocaleString('es-AR')}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={saving}
                  className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-40"
                  style={{ background: '#C4A882', color: '#2C1810', fontFamily: 'var(--font-poppins)' }}
                >
                  {saving ? 'Guardando...' : 'Cobrar y guardar'}
                </button>
              </div>
            )}

            {/* ── Clear cart ── */}
            {(cart.length > 0 || services.length > 0) && (
              <button
                onClick={() => { setCart([]); setServices([]); setCheckoutError(''); setScanError(''); }}
                className="w-full py-2 text-xs rounded-xl border"
                style={{ borderColor: P.cream, color: P.soft }}>
                Limpiar caja
              </button>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: INVENTARIO
        ═══════════════════════════════════════════════════════════════ */}
        {tab === 'inventario' && (
          <div className="px-4 py-5 space-y-4">
            <div className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: P.soft }}>Contabilidad de inventario</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Productos</p>
                  <p className="text-lg font-medium" style={{ color: P.dark }}>{inventory.length}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Unidades en stock</p>
                  <p className="text-lg font-medium" style={{ color: P.dark }}>{totalStockUnits}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Valor costo stock</p>
                  <p className="text-sm font-semibold" style={{ color: '#2E5E38' }}>${totalStockCost.toLocaleString('es-AR')}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Valor venta stock</p>
                  <p className="text-sm font-semibold" style={{ color: '#2E5E38' }}>${totalStockSale.toLocaleString('es-AR')}</p>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: P.soft }}>
                En caja tienes {reservedUnitsInCart} unidad(es) separadas. Stock restante estimado luego de cobrar: {Math.max(0, totalStockUnits - reservedUnitsInCart)}.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Lista completa de inventario</p>
                  <button
                    onClick={() => void refreshInventory()}
                    className="text-xs px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: P.gold, color: P.mid }}
                  >
                    Actualizar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, marca o codigo..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: P.gold, color: P.dark, background: '#fff', fontFamily: 'var(--font-poppins)' }}
                />
              </div>

              {inventoryLoading && <p className="px-4 pb-3 text-xs" style={{ color: P.soft }}>Cargando inventario...</p>}

              {!inventoryLoading && inventoryFiltered.length === 0 && (
                <p className="px-4 pb-3 text-xs" style={{ color: P.soft }}>No hay productos para mostrar.</p>
              )}

              {!inventoryLoading && inventoryFiltered.length > 0 && (
                <div className="max-h-96 overflow-y-auto border-t" style={{ borderColor: P.cream }}>
                  {inventoryFiltered.map((p) => {
                    const inCart = cart.find((c) => c.productId === p.id)?.quantity ?? 0;
                    const availableNow = Math.max(0, p.stock - inCart);

                    return (
                      <div key={p.id} className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: P.cream }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: P.dark }}>{p.name}</p>
                          <p className="text-xs" style={{ color: P.soft }}>
                            {p.brand} · cod {p.barcode || 'N/A'} · stock {p.stock} {p.unit} · minimo {p.minStock} · disponible {availableNow}
                          </p>
                          <p className="text-xs" style={{ color: '#2E5E38' }}>${p.salePrice.toLocaleString('es-AR')} c/u</p>
                        </div>
                        <button
                          onClick={() => { addInventoryItemToCart(p); setTab('caja'); }}
                          disabled={availableNow <= 0}
                          className="px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-40"
                          style={{ background: P.dark, color: '#fff' }}
                        >
                          + Caja
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Salidas y movimientos recientes</p>
                <button
                  onClick={() => void refreshMovements()}
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: P.gold, color: P.mid }}
                >
                  Actualizar
                </button>
              </div>
              {movementsLoading && <p className="px-4 pb-3 text-xs" style={{ color: P.soft }}>Cargando movimientos...</p>}
              {!movementsLoading && movements.length === 0 && (
                <p className="px-4 pb-3 text-xs" style={{ color: P.soft }}>Aun no hay movimientos registrados.</p>
              )}
              {!movementsLoading && movements.length > 0 && (
                <div className="max-h-80 overflow-y-auto border-t" style={{ borderColor: P.cream }}>
                  {movements.map((mv) => (
                    <div key={mv.id} className="px-4 py-3 border-b" style={{ borderColor: P.cream }}>
                      <p className="text-sm font-medium" style={{ color: P.dark }}>
                        {movementLabel[mv.type]}: {mv.productName}
                      </p>
                      <p className="text-xs" style={{ color: P.soft }}>
                        Cantidad: {mv.quantity} {mv.unit} · Quedan: {mv.remainingStock} {mv.unit}
                      </p>
                      <p className="text-xs" style={{ color: P.soft }}>
                        {new Date(mv.createdAt).toLocaleString('es-AR')} · {mv.by || 'Sistema'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <div className="px-4 pt-4 pb-3">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Compras sugeridas</p>
                <p className="text-xs mt-1" style={{ color: P.soft }}>Productos bajo minimo para mantener el negocio con stock.</p>
              </div>
              {purchaseSuggestions.length === 0 && (
                <p className="px-4 pb-4 text-xs" style={{ color: '#2E5E38' }}>Todo en orden. No hay compras urgentes por ahora.</p>
              )}
              {purchaseSuggestions.length > 0 && (
                <div className="border-t" style={{ borderColor: P.cream }}>
                  {purchaseSuggestions.map((p) => (
                    <div key={`buy-${p.id}`} className="px-4 py-3 border-b" style={{ borderColor: P.cream }}>
                      <p className="text-sm font-medium" style={{ color: P.dark }}>{p.name}</p>
                      <p className="text-xs" style={{ color: P.soft }}>
                        Stock actual: {p.stock} {p.unit} · Minimo: {p.minStock} · Sugerido comprar: {p.suggestedQty} {p.unit}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: RESUMEN
        ═══════════════════════════════════════════════════════════════ */}
        {tab === 'resumen' && (
          <div className="px-4 py-5 space-y-4">
            <div className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: P.soft }}>Diagnostico del dia</p>
              <p className="text-2xl font-light" style={{ color: P.dark, fontFamily: 'var(--font-playfair)' }}>
                ${todayRow.profit.toLocaleString('es-AR')}
              </p>
              <p className="text-xs mt-1" style={{ color: trendColor }}>{trendLabel}</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Ingresos hoy</p>
                  <p className="text-sm font-semibold" style={{ color: '#2E5E38' }}>${todayRow.revenue.toLocaleString('es-AR')}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Costo hoy</p>
                  <p className="text-sm font-semibold" style={{ color: P.dark }}>${todayRow.productsCost.toLocaleString('es-AR')}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Servicios hoy</p>
                  <p className="text-sm font-semibold" style={{ color: P.dark }}>${todayRow.services.toLocaleString('es-AR')}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#FBF6F0' }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Productos hoy</p>
                  <p className="text-sm font-semibold" style={{ color: P.dark }}>${todayRow.productsRevenue.toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${P.cream}` }}>
              <div className="px-4 pt-4 pb-3">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Resumen ultimos 7 dias</p>
              </div>
              <div className="border-t" style={{ borderColor: P.cream }}>
                {dailyRows.map((row, idx) => (
                  <div key={row.key || idx} className="px-4 py-3 border-b flex items-center justify-between gap-3" style={{ borderColor: P.cream }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: P.dark }}>
                        {new Date(`${row.key}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-xs" style={{ color: P.soft }}>
                        Operaciones: {row.operations} · Ingresos: ${row.revenue.toLocaleString('es-AR')} · Costo: ${row.productsCost.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: P.soft }}>Ganancia</p>
                      <p className="text-sm font-semibold" style={{ color: row.profit >= 0 ? '#2E5E38' : '#A84444' }}>
                        ${row.profit.toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          MODAL: Enviar turno
      ═════════════════════════════════════════════════════════════════════ */}
      {slotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={(e) => e.target === e.currentTarget && setSlotModal(null)}>
          <div className="w-full rounded-t-3xl p-6 space-y-4" style={{ background: '#fff', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-light italic" style={{ color: P.dark, fontFamily: 'var(--font-playfair)' }}>Enviar turno</h3>
              <button onClick={() => setSlotModal(null)} className="text-xl opacity-40" style={{ color: P.dark }}>×</button>
            </div>
            <p className="text-sm" style={{ color: P.soft }}>{slotModal.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: P.soft }}>Fecha</p>
                <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none"
                  style={{ borderColor: P.gold, color: P.dark }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: P.soft }}>Hora</p>
                <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none"
                  style={{ borderColor: P.gold, color: P.dark }} />
              </div>
            </div>
            {slotResult && (
              <div className="px-3 py-2 rounded-xl text-sm" style={{ background: '#EAF4ED', color: '#2E5E38' }}>{slotResult}</div>
            )}
            <button
              onClick={handleSendSlot}
              disabled={slotSending || !slotDate || !slotTime}
              className="w-full py-3 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ background: P.dark }}>
              {slotSending ? 'Enviando...' : 'Confirmar y notificar'}
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODAL: Agregar servicio
      ═════════════════════════════════════════════════════════════════════ */}
      {svcModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={(e) => e.target === e.currentTarget && setSvcModal(false)}>
          <div className="w-full rounded-t-3xl p-6 space-y-4" style={{ background: '#fff' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-light italic" style={{ color: P.dark, fontFamily: 'var(--font-playfair)' }}>Agregar servicio</h3>
              <button onClick={() => setSvcModal(false)} className="text-xl opacity-40" style={{ color: P.dark }}>×</button>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: P.soft }}>Descripcion</p>
              <input type="text" placeholder="Ej: Corte, Tinte, Keratina..." value={svcName} onChange={(e) => setSvcName(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none"
                style={{ borderColor: P.gold, color: P.dark }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: P.soft }}>Precio ($)</p>
              <input type="number" min="1" placeholder="0" value={svcAmount} onChange={(e) => setSvcAmount(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none"
                style={{ borderColor: P.gold, color: P.dark }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: P.soft }}>Nota (opcional)</p>
              <input type="text" value={svcNotes} onChange={(e) => setSvcNotes(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none"
                style={{ borderColor: P.cream, color: P.dark }} />
            </div>
            <button
              disabled={!svcName.trim() || !(Number(svcAmount) > 0)}
              onClick={() => {
                setServices((prev) => [...prev, { cartId: crypto.randomUUID(), service: svcName.trim(), amount: Number(svcAmount), notes: svcNotes.trim() }]);
                setSvcModal(false);
              }}
              className="w-full py-3 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ background: P.dark }}>
              Agregar al cobro
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODAL: Cobro exitoso
      ═════════════════════════════════════════════════════════════════════ */}
      {saved && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="w-full max-w-xs rounded-3xl p-6 text-center space-y-4" style={{ background: '#fff' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#EAF4ED' }}>
              <span className="text-2xl" style={{ color: '#2E5E38' }}>✓</span>
            </div>
            <h3 className="text-lg font-light italic" style={{ color: P.dark, fontFamily: 'var(--font-playfair)' }}>Cobro guardado</h3>
            <p className="text-sm" style={{ color: P.soft }}>Stock actualizado. Registros guardados.</p>
            <div className="space-y-2">
              {saved.apptId && (
                <a href={`/factura/${saved.apptId}`} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-xl border text-sm font-medium"
                  style={{ borderColor: P.gold, color: P.dark }}>
                  Ver factura del cliente
                </a>
              )}
              <button
                onClick={() => { setSaved(null); setRegApptId(''); setCheckoutError(''); }}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: P.dark }}>
                Nueva operacion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
