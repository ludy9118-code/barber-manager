'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const InventoryPanel = dynamic(() => import('@/components/InventoryPanel'), { ssr: false });

interface TreatmentRecord {
  id: string;
  treatmentId: string;
  treatmentName: string;
  performedAt: string;
  notes: string;
}

interface AccountingEntry {
  id: string;
  service: string;
  amount: number;
  performedBy: string;
  performedAt: string;
  notes: string;
}

interface AppointmentProduct {
  id: string;
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

interface Appointment {
  id: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
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
  slotAccepted: boolean | null;
  slotConfirmedAt: string;
  treatmentsDone: TreatmentRecord[];
  accountingEntries: AccountingEntry[];
  productsUsed: AppointmentProduct[];
}

const PALETTE = {
  dark: '#5C3D35',
  mid: '#7A5C52',
  soft: '#9D7B6F',
  gold: '#C4A882',
  cream: '#F4E8DC',
  bg: '#FBF6F0',
};

const STATUS_LABELS = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada' };
const STATUS_COLORS = { pending: '#C4A882', accepted: '#4E7A59', rejected: '#A84444' };

const TREATMENT_OPTIONS = [
  { id: 'keratina', name: 'Keratina' },
  { id: 'decoloracion', name: 'Decoloración' },
  { id: 'tinte', name: 'Tinte' },
  { id: 'alisado', name: 'Alisado' },
  { id: 'botox', name: 'Botox capilar' },
  { id: 'balayage', name: 'Mechas / Balayage' },
  { id: 'corte', name: 'Corte' },
];

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState('');

  // Notify modal state
  const [notifyModal, setNotifyModal] = useState<{ id: string; name: string } | null>(null);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  // Treatment modal state
  const [treatmentModal, setTreatmentModal] = useState<{ id: string; name: string; existing: TreatmentRecord[] } | null>(null);
  const [txType, setTxType] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState('');

  // Accounting modal state
  const [accountingModal, setAccountingModal] = useState<{ id: string; name: string; existing: AccountingEntry[] } | null>(null);
  const [accService, setAccService] = useState('');
  const [accAmount, setAccAmount] = useState('');
  const [accBy, setAccBy] = useState('');
  const [accDate, setAccDate] = useState(new Date().toISOString().split('T')[0]);
  const [accNotes, setAccNotes] = useState('');

  // Admin panel tab
  const [adminTab, setAdminTab] = useState<'clients' | 'inventory'>('clients');

  // Products-used modal state
  const [productsModal, setProductsModal] = useState<{ id: string; name: string; existing: AppointmentProduct[] } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<{ id: string; name: string; brand: string; unit: string; salePrice: number; stock: number }[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [productBy, setProductBy] = useState('');
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState('');
  const [lastProfessional, setLastProfessional] = useState('');
  const [selectedProductInfo, setSelectedProductInfo] = useState<{ name: string; brand: string; unit: string; salePrice: number; stock: number } | null>(null);

  const fetchAppointments = async (adminKey: string) => {
    setLoading(true);
    const res = await fetch('/api/appointments', { headers: { 'x-admin-key': adminKey } });
    if (res.status === 401) { setAuthError(true); setAuthed(false); setLoading(false); return; }
    setAppointments(await res.json());
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setAuthed(true);
    await fetchAppointments(key);
  };

  const patch = async (id: string, body: object) => {
    setSaving(id);
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify(body),
    });
    await fetchAppointments(key);
    setSaving('');
  };

  const handleNotify = async () => {
    if (!notifyModal || !slotDate || !slotTime) return;
    setNotifyLoading(true);
    setNotifyResult(null);

    // Format slot as readable label: "Lunes 28 de abril a las 10:00 am"
    const dt = new Date(`${slotDate}T${slotTime}`);
    const label = dt.toLocaleString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    // First accept and set slot via patch
    await patch(notifyModal.id, {
      availableSlots: [label],
      notifiedAt: new Date().toISOString(),
      status: 'accepted',
    });

    // Then fire push notification
    const pushRes = await fetch('/api/notifications/send-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ appointmentId: notifyModal.id, slot: label }),
    });
    const pushJson = await pushRes.json();

    if (pushJson.pushed) {
      setNotifyResult('✅ Notificación enviada al teléfono de la cliente.');
    } else if (pushJson.reason === 'no_subscriptions') {
      setNotifyResult('⚠️ Turno guardado. La cliente aún no activó notificaciones push.');
    } else {
      setNotifyResult('⚠️ Turno guardado. Push no configurado en el servidor.');
    }

    setNotifyLoading(false);
    setTimeout(() => {
      setNotifyModal(null);
      setSlotDate('');
      setSlotTime('');
      setNotifyResult(null);
    }, 2200);
  };

  const handleAddTreatment = async () => {
    if (!treatmentModal || !txType) return;
    const option = TREATMENT_OPTIONS.find((t) => t.id === txType);
    const newRecord: TreatmentRecord = {
      id: crypto.randomUUID(),
      treatmentId: txType,
      treatmentName: option?.name ?? txType,
      performedAt: txDate,
      notes: txNotes,
    };
    await patch(treatmentModal.id, {
      treatmentsDone: [...(treatmentModal.existing ?? []), newRecord],
      status: 'accepted',
    });
    setTreatmentModal(null);
    setTxType('');
    setTxNotes('');
    setTxDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddAccounting = async () => {
    if (!accountingModal || !accService.trim() || !accBy.trim()) return;

    const parsedAmount = Number(accAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    const newEntry: AccountingEntry = {
      id: crypto.randomUUID(),
      service: accService.trim(),
      amount: parsedAmount,
      performedBy: accBy.trim(),
      performedAt: accDate,
      notes: accNotes.trim(),
    };

    await patch(accountingModal.id, {
      accountingEntries: [...(accountingModal.existing ?? []), newEntry],
    });

    setAccountingModal(null);
    setAccService('');
    setAccAmount('');
    setAccBy('');
    setAccDate(new Date().toISOString().split('T')[0]);
    setAccNotes('');
  };

  const searchProducts = async (q: string) => {
    setProductSearch(q);
    setSelectedProductId('');
    setSelectedProductInfo(null);
    if (!q.trim()) { setProductResults([]); return; }
    setProductSearchLoading(true);
    const res = await fetch('/api/products', { headers: { 'x-admin-key': key } });
    if (res.ok) {
      const all = await res.json() as { id: string; name: string; brand: string; unit: string; salePrice: number; stock: number; barcode: string }[];
      const lower = q.toLowerCase();
      setProductResults(all.filter((p) =>
        p.name.toLowerCase().includes(lower) || p.brand.toLowerCase().includes(lower) || p.barcode === q
      ));
    }
    setProductSearchLoading(false);
  };

  const handleAddProduct = async () => {
    if (!productsModal || !selectedProductId || Number(productQty) <= 0) return;
    setProductSaving(true);
    setProductError('');
    const res = await fetch(`/api/appointments/${productsModal.id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ productId: selectedProductId, quantity: Number(productQty), usedBy: productBy }),
    });
    const json = await res.json();
    if (!res.ok) {
      setProductError(json.error ?? 'Error al agregar el insumo.');
    } else {
      if (productBy.trim()) setLastProfessional(productBy.trim());
      await fetchAppointments(key);
      setSelectedProductId('');
      setSelectedProductInfo(null);
      setProductQty('1');
      setProductSearch('');
      setProductResults([]);
      setProductError('');
      setProductsModal((m) => m ? { ...m, existing: [...m.existing, json.entry] } : null);
    }
    setProductSaving(false);
  };

  const handleRemoveProduct = async (appointmentId: string, entryId: string) => {
    await fetch(`/api/appointments/${appointmentId}/products?entryId=${entryId}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': key },
    });
    await fetchAppointments(key);
    setProductsModal((m) => m ? { ...m, existing: m.existing.filter((p) => p.id !== entryId) } : null);
  };

  const totalRevenue = appointments.reduce(
    (sum, a) => sum + (a.accountingEntries ?? []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    0
  );

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    accepted: appointments.filter((a) => a.status === 'accepted').length,
    rejected: appointments.filter((a) => a.status === 'rejected').length,
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PALETTE.bg }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm p-5 sm:p-10 rounded-2xl shadow-lg"
          style={{ background: '#fff', border: `1px solid ${PALETTE.cream}` }}>
          <h1 className="text-xl sm:text-2xl font-light italic mb-6 text-center" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
            Panel Administrativo
          </h1>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
            placeholder="Contraseña de acceso"
            className="w-full px-4 py-3 border rounded-lg mb-4 outline-none"
            style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }} />
          {authError && <p className="text-sm mb-3 text-center" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)' }}>Contraseña incorrecta</p>}
          <button type="submit" className="w-full py-3 rounded-lg text-white text-sm tracking-widest uppercase font-medium"
            style={{ background: `linear-gradient(135deg, ${PALETTE.mid}, ${PALETTE.gold})`, fontFamily: 'var(--font-poppins)' }}>
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  // ── PANEL ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: PALETTE.bg, fontFamily: 'var(--font-poppins)' }}>

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b" style={{ background: PALETTE.dark }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-sm sm:text-xl font-light italic tracking-[0.08em] sm:tracking-widest text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            Color Studio Gustavo — Panel Admin
          </h1>
          <button onClick={() => { setAuthed(false); setKey(''); }}
            className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 text-white transition">
            Salir
          </button>
        </div>
        {/* Tab switcher */}
        <div className="max-w-6xl mx-auto flex gap-1 mt-4">
          {(['clients', 'inventory'] as const).map((tab) => (
            <button key={tab} onClick={() => setAdminTab(tab)}
              className="px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition font-medium"
              style={{
                background: adminTab === tab ? PALETTE.gold : 'transparent',
                color: adminTab === tab ? PALETTE.dark : 'rgba(255,255,255,0.55)',
              }}>
              {tab === 'clients' ? 'Clientes' : 'Inventario'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8">

        {/* ── INVENTORY TAB ──────────────────────────────────────────── */}
        {adminTab === 'inventory' && <InventoryPanel adminKey={key} />}

        {/* ── CLIENTS TAB ────────────────────────────────────────────── */}
        {adminTab === 'clients' && (
        <div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {[
            { label: 'Total', value: counts.total, color: PALETTE.dark },
            { label: 'Pendientes', value: counts.pending, color: '#B5862A' },
            { label: 'Aceptadas', value: counts.accepted, color: '#4E7A59' },
            { label: 'Rechazadas', value: counts.rejected, color: '#A84444' },
            { label: 'Facturación', value: `$${totalRevenue.toLocaleString('es-AR')}`, color: PALETTE.mid },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 sm:p-5 text-center shadow-sm" style={{ background: '#fff', border: `1px solid ${PALETTE.cream}` }}>
              <p className="text-xl sm:text-3xl font-light break-words" style={{ color }}>{value}</p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: PALETTE.soft }}>{label}</p>
            </div>
          ))}
        </div>

        {/* List header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-light" style={{ color: PALETTE.dark }}>Solicitudes de valoración</h2>
          <button onClick={() => fetchAppointments(key)}
            className="text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition"
            style={{ background: PALETTE.cream, color: PALETTE.dark }}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-center py-12 opacity-40" style={{ color: PALETTE.dark }}>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p className="text-center py-12 opacity-40" style={{ color: PALETTE.dark }}>No hay solicitudes aún</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#fff', border: `1px solid ${PALETTE.cream}` }}>

                {/* Summary row */}
                <div className="flex flex-wrap gap-3 items-center justify-between px-4 sm:px-6 py-4 cursor-pointer select-none"
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                  <div>
                    <p className="font-medium" style={{ color: PALETTE.dark }}>{a.fullName}</p>
                    <p className="text-xs opacity-60 mt-0.5" style={{ color: PALETTE.dark }}>
                      {new Date(a.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {a.clientPhone && (
                      <p className="text-xs mt-0.5" style={{ color: PALETTE.soft }}>{a.clientPhone}</p>
                    )}
                  </div>
                  <p className="text-sm w-full sm:w-auto sm:max-w-xs truncate opacity-70" style={{ color: PALETTE.dark }}>{a.procedure}</p>
                  <span className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: STATUS_COLORS[a.status] + '22', color: STATUS_COLORS[a.status] }}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  <span className="text-xs opacity-40" style={{ color: PALETTE.dark }}>{expanded === a.id ? '▲' : '▼'}</span>
                </div>

                {/* Confirmed slot indicator */}
                {a.confirmedSlot && (
                  <div
                    className="px-4 sm:px-6 py-2 text-xs flex items-center gap-2"
                    style={{
                      background: a.slotAccepted === true ? '#EAF4ED' : a.slotAccepted === false ? '#FAE8E8' : '#FBF3E0',
                      borderTop: `1px solid ${a.slotAccepted === true ? '#C8E6C9' : a.slotAccepted === false ? '#F5C6C6' : '#E8D5A0'}`,
                    }}
                  >
                    <span style={{ color: a.slotAccepted === true ? '#2E5E38' : a.slotAccepted === false ? '#A84444' : '#B5862A' }}>
                      {a.slotAccepted === true ? 'Aceptó' : a.slotAccepted === false ? 'Rechazó' : 'Sin respuesta'}
                    </span>
                    <span style={{ color: PALETTE.mid }}>{a.confirmedSlot}</span>
                    {a.slotConfirmedAt && (
                      <span className="opacity-50" style={{ color: PALETTE.dark }}>
                        · {new Date(a.slotConfirmedAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded detail */}
                {expanded === a.id && (
                  <div className="border-t" style={{ borderColor: PALETTE.cream, background: PALETTE.bg }}>

                    {/* ── FOTOS ─────────────────────────────────────────── */}
                    {(a.referencePhotoPath || a.currentPhotoPath) && (
                      <div className="px-4 sm:px-6 pt-6 pb-4">
                        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: PALETTE.soft }}>Fotos enviadas por la cliente</p>
                        <div className="grid sm:grid-cols-2 gap-5">
                          {a.currentPhotoPath && (
                            <div>
                              <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: PALETTE.dark }}>Cabello actual</p>
                              <a href={a.currentPhotoPath} target="_blank" rel="noopener noreferrer">
                                <div className="relative w-full h-[220px] sm:h-[280px] rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: PALETTE.gold }}>
                                  <Image src={a.currentPhotoPath} alt="Cabello actual" fill sizes="400px" className="object-cover hover:scale-105 transition-transform duration-300" />
                                </div>
                                <p className="text-xs mt-1 text-center opacity-50" style={{ color: PALETTE.dark }}>Clic para ver en tamaño completo</p>
                              </a>
                            </div>
                          )}
                          {a.referencePhotoPath && (
                            <div>
                              <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: PALETTE.dark }}>Foto de inspiración</p>
                              <a href={a.referencePhotoPath} target="_blank" rel="noopener noreferrer">
                                <div className="relative w-full h-[220px] sm:h-[280px] rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: PALETTE.gold }}>
                                  <Image src={a.referencePhotoPath} alt="Foto de referencia" fill sizes="400px" className="object-cover hover:scale-105 transition-transform duration-300" />
                                </div>
                                <p className="text-xs mt-1 text-center opacity-50" style={{ color: PALETTE.dark }}>Clic para ver en tamaño completo</p>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── DATOS DEL AGENDAMIENTO ────────────────────────── */}
                    <div className="px-4 sm:px-6 py-4">
                      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: PALETTE.soft }}>Datos del agendamiento</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <DetailBox label="Procedimiento deseado" value={a.procedure} />
                        <DetailBox label="Disponibilidad preferida" value={a.preferredDates || '—'} />
                        <DetailBox label="Resultado que sueña" value={a.dreamResult || '—'} wide />
                        <DetailBox label="Historial capilar" value={[...a.hairHistory, a.hairHistoryOther].filter(Boolean).join(' · ') || 'Sin historial indicado'} wide />
                      </div>
                    </div>

                    {/* ── TURNOS NOTIFICADOS ────────────────────────────── */}
                    {a.availableSlots.length > 0 && (
                      <div className="mx-4 sm:mx-6 mb-4 rounded-xl p-4" style={{ background: '#EAF4ED', border: '1px solid #C8E6C9' }}>
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#4E7A59' }}>Turnos notificados a la cliente</p>
                        <div className="flex flex-wrap gap-2">
                          {a.availableSlots.map((s, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#fff', color: '#2E5E38', border: '1px solid #C8E6C9' }}>{s}</span>
                          ))}
                        </div>
                        <p className="text-xs mt-3 opacity-50" style={{ color: '#2E5E38' }}>
                          Enviado el: {a.notifiedAt ? new Date(a.notifiedAt).toLocaleString('es-AR') : '—'}
                        </p>
                      </div>
                    )}

                    {/* ── NOTAS INTERNAS ────────────────────────────────── */}
                    <div className="px-4 sm:px-6 pb-4">
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Notas internas (no visibles a la cliente)</p>
                      <textarea rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none outline-none"
                        style={{ borderColor: PALETTE.gold, color: PALETTE.dark, background: '#fff', fontFamily: 'var(--font-poppins)' }}
                        defaultValue={a.adminNotes}
                        onBlur={(e) => { if (e.target.value !== a.adminNotes) patch(a.id, { adminNotes: e.target.value }); }}
                        placeholder="Ej: cabello muy procesado, consultar precio antes..." />
                    </div>

                    {/* ── ACCIONES ──────────────────────────────────────── */}
                    <div className="px-4 sm:px-6 pb-4">
                      <div className="flex flex-wrap gap-3 p-4 rounded-xl" style={{ background: PALETTE.cream }}>
                        <ActionBtn label="Aceptar cliente" disabled={a.status === 'accepted' || saving === a.id}
                          color="#4E7A59" bg="#EAF4ED" border="#C8E6C9"
                          onClick={() => patch(a.id, { status: 'accepted' })} />
                        <ActionBtn label="No aceptar" disabled={a.status === 'rejected' || saving === a.id}
                          color="#A84444" bg="#FAE8E8" border="#F5C6C6"
                          onClick={() => patch(a.id, { status: 'rejected' })} />
                        <ActionBtn label="Enviar fecha y hora de cita" disabled={saving === a.id}
                          color={PALETTE.mid} bg="#fff" border={PALETTE.gold}
                          onClick={() => { setNotifyModal({ id: a.id, name: a.fullName }); setSlotDate(''); setSlotTime(''); setNotifyResult(null); }} />
                        <ActionBtn label="Insumos usados" disabled={saving === a.id}
                          color="#2E5E38" bg="#EAF4ED" border="#C8E6C9"
                          onClick={() => { setProductsModal({ id: a.id, name: a.fullName, existing: a.productsUsed ?? [] }); setSelectedProductId(''); setSelectedProductInfo(null); setProductQty('1'); setProductSearch(''); setProductResults([]); setProductError(''); setProductBy(lastProfessional); }} />
                        <a href={`/factura/${a.id}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-5 py-2 rounded-lg border font-medium min-h-[44px] flex items-center gap-1 transition"
                          style={{ color: '#5C3D35', background: '#FAF0E8', borderColor: '#C4A882' }}>
                          Generar factura
                        </a>
                        <a href={`/appointment/status/${a.id}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-4 py-2 rounded-lg border transition min-h-[44px] flex items-center"
                          style={{ color: PALETTE.soft, borderColor: PALETTE.gold, background: 'transparent' }}>
                          Ver página de la cliente
                        </a>
                      </div>
                    </div>

                    {/* ── HISTORIAL DE TRATAMIENTOS ─────────────────────── */}
                    <div className="px-4 sm:px-6 pb-6">
                      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: PALETTE.gold }}>
                        <div className="flex items-center justify-between px-4 py-3" style={{ background: PALETTE.dark }}>
                          <p className="text-xs uppercase tracking-widest text-white font-medium">Tratamientos realizados</p>
                          <button
                            onClick={() => setTreatmentModal({ id: a.id, name: a.fullName, existing: a.treatmentsDone ?? [] })}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                            style={{ background: PALETTE.gold, color: PALETTE.dark }}>
                            + Registrar tratamiento
                          </button>
                        </div>
                        {(!a.treatmentsDone || a.treatmentsDone.length === 0) ? (
                          <div className="px-4 py-6 text-center" style={{ background: '#fff' }}>
                            <p className="text-sm opacity-40" style={{ color: PALETTE.dark }}>Aún no se han registrado tratamientos</p>
                          </div>
                        ) : (
                          <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
                            {(a.treatmentsDone ?? []).map((tx) => (
                              <div key={tx.id} className="flex items-start gap-4 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm" style={{ color: PALETTE.dark }}>{tx.treatmentName}</p>
                                  <p className="text-xs opacity-60 mt-0.5" style={{ color: PALETTE.dark }}>
                                    {new Date(tx.performedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </p>
                                  {tx.notes && <p className="text-xs mt-1 italic" style={{ color: PALETTE.soft }}>{tx.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── CONTROL CONTABLE ───────────────────────────────── */}
                    <div className="px-4 sm:px-6 pb-6">
                      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: PALETTE.gold }}>
                        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#2E2521' }}>
                          <p className="text-xs uppercase tracking-widest text-white font-medium">Control contable</p>
                          <button
                            onClick={() => setAccountingModal({ id: a.id, name: a.fullName, existing: a.accountingEntries ?? [] })}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                            style={{ background: PALETTE.gold, color: PALETTE.dark }}>
                            + Registrar costo
                          </button>
                        </div>

                        <div className="px-4 py-3 border-b" style={{ background: '#FFF', borderColor: PALETTE.cream }}>
                          <p className="text-xs uppercase tracking-widest" style={{ color: PALETTE.soft }}>Total de esta clienta</p>
                          <p className="text-2xl font-light" style={{ color: PALETTE.dark }}>
                            ${((a.accountingEntries ?? []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)).toLocaleString('es-AR')}
                          </p>
                        </div>

                        {(!a.accountingEntries || a.accountingEntries.length === 0) ? (
                          <div className="px-4 py-6 text-center" style={{ background: '#fff' }}>
                            <p className="text-sm opacity-40" style={{ color: PALETTE.dark }}>Aún no se registraron movimientos contables</p>
                          </div>
                        ) : (
                          <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
                            {[...(a.accountingEntries ?? [])]
                              .sort((x, y) => new Date(y.performedAt).getTime() - new Date(x.performedAt).getTime())
                              .map((entry) => (
                                <div key={entry.id} className="px-4 py-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm" style={{ color: PALETTE.dark }}>{entry.service}</p>
                                      <p className="text-xs opacity-70" style={{ color: PALETTE.soft }}>
                                        Realizado por: {entry.performedBy} · {new Date(entry.performedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                      </p>
                                      {entry.notes && <p className="text-xs mt-1 italic" style={{ color: PALETTE.soft }}>{entry.notes}</p>}
                                    </div>
                                    <p className="text-sm font-medium" style={{ color: '#2E5E38' }}>
                                      ${Number(entry.amount).toLocaleString('es-AR')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── INSUMOS UTILIZADOS ─────────────────────────── */}
                    {(a.productsUsed && a.productsUsed.length > 0) && (
                      <div className="px-4 sm:px-6 pb-6">
                        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: PALETTE.gold }}>
                          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1E3328' }}>
                            <p className="text-xs uppercase tracking-widest text-white font-medium">Insumos utilizados</p>
                            <p className="text-xs text-white opacity-60">
                              Subtotal: ${(a.productsUsed ?? []).reduce((s, p) => s + p.salePrice * p.quantity, 0).toLocaleString('es-AR')}
                            </p>
                          </div>
                          <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
                            {(a.productsUsed ?? []).map((p) => (
                              <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>{p.productName}</p>
                                  <p className="text-xs opacity-60" style={{ color: PALETTE.dark }}>
                                    {p.brand} · {p.quantity} {p.unit}{p.usedBy && ` · por ${p.usedBy}`}
                                  </p>
                                </div>
                                <p className="text-sm font-medium" style={{ color: '#2E5E38' }}>
                                  ${(p.salePrice * p.quantity).toLocaleString('es-AR')}
                                </p>
                              </div>
                            ))}
                          </div>
                          {/* Grand total */}
                          <div className="px-4 py-3 flex justify-between items-center" style={{ background: PALETTE.cream }}>
                            <p className="text-xs uppercase tracking-widest" style={{ color: PALETTE.soft }}>Total (servicio + insumos)</p>
                            <p className="text-lg font-medium" style={{ color: PALETTE.dark }}>
                              ${((a.accountingEntries ?? []).reduce((s, e) => s + Number(e.amount), 0) +
                                (a.productsUsed ?? []).reduce((s, p) => s + p.salePrice * p.quantity, 0)).toLocaleString('es-AR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── HISTORIAL COMPLETO DE LA CLIENTA ──────────────── */}
                    {a.clientPhone && (() => {
                      const clientVisits = appointments.filter(
                        (other) => other.clientPhone === a.clientPhone && other.id !== a.id && other.status === 'accepted'
                      ).sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());

                      if (clientVisits.length === 0) return null;

                      return (
                        <div className="px-4 sm:px-6 pb-6">
                          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: PALETTE.gold }}>
                            <div className="px-4 py-3" style={{ background: '#3B1F18' }}>
                              <p className="text-xs uppercase tracking-widest text-white font-medium">
                                Historial completo — {a.fullName} ({clientVisits.length} visita{clientVisits.length !== 1 ? 's' : ''} anterior{clientVisits.length !== 1 ? 'es' : ''})
                              </p>
                            </div>
                            <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
                              {clientVisits.map((visit) => {
                                const visitTotal = (visit.accountingEntries ?? []).reduce((s, e) => s + Number(e.amount), 0) +
                                  (visit.productsUsed ?? []).reduce((s, p) => s + p.salePrice * p.quantity, 0);
                                const visitDate = visit.confirmedSlot ||
                                  new Date(visit.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
                                return (
                                  <div key={visit.id} className="flex items-start justify-between gap-3 px-4 py-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>{visit.procedure}</p>
                                      <p className="text-xs opacity-60 mt-0.5" style={{ color: PALETTE.dark }}>{visitDate}</p>
                                      {(visit.treatmentsDone ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {(visit.treatmentsDone ?? []).map((tx) => (
                                            <span key={tx.id} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: PALETTE.cream, color: PALETTE.soft }}>
                                              {tx.treatmentName}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                      {visitTotal > 0 && (
                                        <p className="text-sm font-medium" style={{ color: '#2E5E38' }}>${visitTotal.toLocaleString('es-AR')}</p>
                                      )}
                                      <a
                                        href={`/factura/${visit.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                                        style={{ color: PALETTE.mid, borderColor: PALETTE.gold, background: '#FAF0E8' }}
                                      >
                                        Ver factura
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Lifetime total */}
                            <div className="px-4 py-3 flex justify-between items-center" style={{ background: PALETTE.cream }}>
                              <p className="text-xs uppercase tracking-widest" style={{ color: PALETTE.soft }}>Total acumulado (toda la historia)</p>
                              <p className="text-lg font-medium" style={{ color: PALETTE.dark }}>
                                ${[...clientVisits, a].reduce((sum, v) =>
                                  sum +
                                  (v.accountingEntries ?? []).reduce((s, e) => s + Number(e.amount), 0) +
                                  (v.productsUsed ?? []).reduce((s, p) => s + p.salePrice * p.quantity, 0),
                                  0
                                ).toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
        )}
      </div>

      {/* ── MODAL: Enviar fecha y hora de cita ──────────────────────────────── */}
      {notifyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-5 sm:p-8 shadow-2xl" style={{ background: '#fff' }}>
            <h3 className="text-lg font-light italic mb-1" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
              Enviar fecha y hora de cita
            </h3>
            <p className="text-sm mb-5 opacity-60" style={{ color: PALETTE.dark }}>Para: {notifyModal.name}</p>

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Fecha</p>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
            />

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Hora</p>
            <input
              type="time"
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-5"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
            />

            {notifyResult && (
              <p className="text-sm mb-4 text-center" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
                {notifyResult}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setNotifyModal(null); setSlotDate(''); setSlotTime(''); setNotifyResult(null); }}
                className="flex-1 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: PALETTE.gold, color: PALETTE.soft }}>
                Cancelar
              </button>
              <button
                onClick={handleNotify}
                disabled={!slotDate || !slotTime || notifyLoading}
                className="flex-1 py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${PALETTE.mid}, ${PALETTE.gold})` }}>
                {notifyLoading ? 'Enviando...' : 'Enviar notificación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Registrar tratamiento ────────────────────────────── */}
      {treatmentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl p-5 sm:p-8 shadow-2xl" style={{ background: '#fff' }}>
            <h3 className="text-lg font-light italic mb-1" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
              Registrar tratamiento realizado
            </h3>
            <p className="text-sm mb-5 opacity-60" style={{ color: PALETTE.dark }}>Para: {treatmentModal.name}</p>

            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: PALETTE.soft }}>Tratamiento realizado</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
              {TREATMENT_OPTIONS.map((t) => (
                <button key={t.id} onClick={() => setTxType(t.id)}
                  className="px-3 py-2.5 rounded-xl border text-sm transition"
                  style={{
                    borderColor: txType === t.id ? PALETTE.dark : PALETTE.gold,
                    background: txType === t.id ? PALETTE.dark : '#fff',
                    color: txType === t.id ? '#fff' : PALETTE.dark,
                    fontFamily: 'var(--font-poppins)',
                  }}>
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Fecha del tratamiento</p>
            <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }} />

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Observaciones (opcional)</p>
            <textarea rows={2} value={txNotes} onChange={(e) => setTxNotes(e.target.value)}
              placeholder="Ej: queratina express, cabello muy poroso, producto X..."
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none mb-5"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }} />

            <div className="flex gap-3">
              <button onClick={() => { setTreatmentModal(null); setTxType(''); setTxNotes(''); }}
                className="flex-1 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: PALETTE.gold, color: PALETTE.soft }}>
                Cancelar
              </button>
              <button onClick={handleAddTreatment} disabled={!txType}
                className="flex-1 py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${PALETTE.dark}, ${PALETTE.mid})` }}>
                Guardar tratamiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Registrar costo ─────────────────────────────── */}
      {accountingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl p-5 sm:p-8 shadow-2xl" style={{ background: '#fff' }}>
            <h3 className="text-lg font-light italic mb-1" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
              Registrar movimiento contable
            </h3>
            <p className="text-sm mb-5 opacity-60" style={{ color: PALETTE.dark }}>Cliente: {accountingModal.name}</p>

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Servicio realizado</p>
            <input
              type="text"
              value={accService}
              onChange={(e) => setAccService(e.target.value)}
              placeholder="Ej: Keratina premium"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
            />

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Costo</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accAmount}
                  onChange={(e) => setAccAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                  style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Fecha</p>
                <input
                  type="date"
                  value={accDate}
                  onChange={(e) => setAccDate(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                  style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
                />
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Profesional que realizó el trabajo</p>
            <input
              type="text"
              value={accBy}
              onChange={(e) => setAccBy(e.target.value)}
              placeholder="Nombre del profesional"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
            />

            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Notas (opcional)</p>
            <textarea
              rows={2}
              value={accNotes}
              onChange={(e) => setAccNotes(e.target.value)}
              placeholder="Observaciones del movimiento"
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none mb-5"
              style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAccountingModal(null);
                  setAccService('');
                  setAccAmount('');
                  setAccBy('');
                  setAccDate(new Date().toISOString().split('T')[0]);
                  setAccNotes('');
                }}
                className="flex-1 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: PALETTE.gold, color: PALETTE.soft }}>
                Cancelar
              </button>
              <button
                onClick={handleAddAccounting}
                disabled={!accService.trim() || !accBy.trim() || !(Number(accAmount) > 0)}
                className="flex-1 py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${PALETTE.dark}, ${PALETTE.mid})` }}>
                Guardar movimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Insumos usados en cita ─────────────────────────── */}
      {productsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-y-auto max-h-[90vh]" style={{ background: '#fff' }}>
            <div className="sticky top-0 px-5 pt-5 pb-4 border-b" style={{ background: '#fff', borderColor: PALETTE.cream }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-light italic" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
                    Insumos utilizados
                  </h3>
                  <p className="text-xs opacity-60" style={{ color: PALETTE.dark }}>{productsModal.name}</p>
                </div>
                <button onClick={() => setProductsModal(null)} className="text-xl opacity-40 hover:opacity-70" style={{ color: PALETTE.dark }}>✕</button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Already added products */}
              {productsModal.existing.length > 0 && (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: PALETTE.cream }}>
                  <div className="px-3 py-2" style={{ background: PALETTE.bg }}>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: PALETTE.soft }}>Insumos ya cargados</p>
                  </div>
                  <div className="divide-y" style={{ borderColor: PALETTE.cream }}>
                    {productsModal.existing.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>{p.productName}</p>
                          <p className="text-xs opacity-60" style={{ color: PALETTE.dark }}>{p.quantity} {p.unit} · ${(p.salePrice * p.quantity).toLocaleString('es-AR')}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(productsModal.id, p.id)}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ color: '#A84444', background: '#FAE8E8' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2 text-right" style={{ background: '#EAF4ED' }}>
                    <p className="text-xs font-medium" style={{ color: '#2E5E38' }}>
                      Subtotal insumos: ${productsModal.existing.reduce((s, p) => s + p.salePrice * p.quantity, 0).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              )}

              {/* Search + add product */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PALETTE.soft }}>Buscar o escanear insumo</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre, marca o código de barras..."
                    value={productSearch}
                    onChange={(e) => searchProducts(e.target.value)}
                    className="flex-1 px-3 py-2.5 border rounded-lg text-sm outline-none"
                    style={{ borderColor: PALETTE.gold, color: PALETTE.dark, fontFamily: 'var(--font-poppins)', background: '#fff' }}
                  />
                </div>

                {productSearchLoading && <p className="text-xs opacity-50 py-2" style={{ color: PALETTE.dark }}>Buscando...</p>}

                {productResults.length > 0 && (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: PALETTE.cream }}>
                    {productResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedProductId(p.id); setSelectedProductInfo({ name: p.name, brand: p.brand, unit: p.unit, salePrice: p.salePrice, stock: p.stock }); setProductResults([]); setProductSearch(p.name); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 border-b text-left transition"
                        style={{ borderColor: PALETTE.cream, background: selectedProductId === p.id ? PALETTE.cream : '#fff' }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>{p.name}</p>
                          <p className="text-xs opacity-60" style={{ color: PALETTE.dark }}>{p.brand} · stock: {p.stock} {p.unit}</p>
                        </div>
                        <p className="text-sm font-medium ml-3" style={{ color: '#2E5E38' }}>${p.salePrice.toLocaleString('es-AR')}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedProductId && (
                  <div className="mt-3 space-y-3">
                    {/* Product price card */}
                    {selectedProductInfo && (
                      <div className="rounded-xl p-3 border" style={{ background: '#EAF4ED', borderColor: '#C8E6C9' }}>
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#2E5E38' }}>Insumo seleccionado</p>
                        <p className="text-sm font-medium" style={{ color: PALETTE.dark }}>{selectedProductInfo.name}</p>
                        <p className="text-xs opacity-70 mb-2" style={{ color: PALETTE.dark }}>{selectedProductInfo.brand} · stock disponible: {selectedProductInfo.stock} {selectedProductInfo.unit}</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs" style={{ color: PALETTE.soft }}>Precio unitario:</span>
                          <span className="text-lg font-semibold" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>
                            ${selectedProductInfo.salePrice.toLocaleString('es-AR')} <span className="text-xs font-normal">/ {selectedProductInfo.unit}</span>
                          </span>
                        </div>
                        {Number(productQty) > 0 && (
                          <div className="flex items-baseline justify-between mt-1 pt-1 border-t" style={{ borderColor: '#C8E6C9' }}>
                            <span className="text-xs" style={{ color: PALETTE.soft }}>Subtotal ({productQty} {selectedProductInfo.unit}):</span>
                            <span className="text-base font-bold" style={{ color: '#2E5E38' }}>
                              ${(selectedProductInfo.salePrice * Number(productQty)).toLocaleString('es-AR')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3 rounded-xl" style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.cream}` }}>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: PALETTE.soft }}>Cantidad usada</p>
                        <input
                          type="number" min="1" step="0.5"
                          value={productQty}
                          onChange={(e) => setProductQty(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                          style={{ borderColor: PALETTE.gold, color: PALETTE.dark, background: '#fff' }}
                        />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: PALETTE.soft }}>Profesional</p>
                        <input
                          type="text"
                          value={productBy}
                          onChange={(e) => setProductBy(e.target.value)}
                          placeholder="Nombre"
                          className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                          style={{ borderColor: PALETTE.gold, color: PALETTE.dark, background: '#fff' }}
                        />
                      </div>
                    </div>
                    {productError && <p className="text-xs mb-2" style={{ color: '#A84444' }}>{productError}</p>}
                    <button
                      onClick={handleAddProduct}
                      disabled={productSaving || !productQty || Number(productQty) <= 0}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #2E5E38, #4E8C5E)' }}>
                      {productSaving ? 'Agregando...' : '+ Agregar insumo y descontar stock'}
                    </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pb-3">
                <button onClick={() => setProductsModal(null)}
                  className="w-full py-3 rounded-xl border text-sm"
                  style={{ borderColor: PALETTE.gold, color: PALETTE.soft }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function DetailBox({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl p-4${wide ? ' sm:col-span-2' : ''}`} style={{ background: '#fff', border: '1px solid #F4E8DC' }}>
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#9D7B6F' }}>{label}</p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#5C3D35' }}>{value}</p>
    </div>
  );
}

function ActionBtn({ label, onClick, disabled, color, bg, border }: {
  label: string; onClick: () => void; disabled?: boolean; color: string; bg: string; border: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="text-xs px-5 py-2 rounded-lg border transition disabled:opacity-40 font-medium min-h-[44px]"
      style={{ color, background: bg, borderColor: border }}>
      {label}
    </button>
  );
}
