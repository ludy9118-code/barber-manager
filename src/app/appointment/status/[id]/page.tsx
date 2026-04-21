'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTreatmentById } from '@/lib/treatments';

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
  clientPhone: string;
  availableSlots: string[];
  notifiedAt: string;
  confirmedSlot: string;
  slotAccepted: boolean | null;
  slotConfirmedAt: string;
  treatmentsDone: TreatmentRecord[];
  accountingEntries: AccountingEntry[];
  productsUsed: AppointmentProduct[];
}

interface HistoryEntry {
  id: string;
  createdAt: string;
  procedure: string;
  confirmedSlot: string;
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

export default function StatusPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState('');
  const [slotConfirming, setSlotConfirming] = useState(false);
  const [slotDone, setSlotDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'profile' | 'care' | 'facturas'>('status');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMsg, setPushMsg] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          if (d.treatmentsDone && d.treatmentsDone.length > 0) setActiveTab('profile');
          // Load full client history by phone
          if (d.clientPhone) {
            fetch(`/api/clients/history?phone=${encodeURIComponent(d.clientPhone)}`)
              .then((r) => r.ok ? r.json() : [])
              .then((hist: HistoryEntry[]) => setHistory(hist));
          }
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PALETTE.bg }}>
        <p style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>Cargando tu perfil...</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: PALETTE.bg }}>
        <p className="text-lg" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>No encontramos tu solicitud.</p>
        <Link href="/appointment" className="text-sm underline" style={{ color: PALETTE.soft }}>Volver al inicio</Link>
      </div>
    );
  }

  const hasTreatments = data.treatmentsDone && data.treatmentsDone.length > 0;
  const latestTreatment = hasTreatments ? data.treatmentsDone[data.treatmentsDone.length - 1] : null;
  const latestInfo = latestTreatment ? getTreatmentById(latestTreatment.treatmentId) : null;

  const statusConfig = {
    pending: {
      badge: 'En revision',
      title: 'Solicitud en revisión',
      color: '#B5862A',
      bg: '#FBF3E0',
      border: '#E8D5A0',
      msg: 'Tu valoración está siendo revisada. Te notificaremos muy pronto con los turnos disponibles.',
    },
    accepted: {
      badge: 'Aprobada',
      title: '¡Tu cita fue aceptada!',
      color: '#4E7A59',
      bg: '#EAF4ED',
      border: '#C8E6C9',
      msg: data.availableSlots?.length > 0
        ? 'Hemos preparado turnos disponibles para vos. Elegí el que mejor te quede.'
        : 'Tu solicitud fue aceptada. Pronto recibirás los horarios.',
    },
    rejected: {
      badge: 'No disponible',
      title: 'No disponible por el momento',
      color: '#A84444',
      bg: '#FAE8E8',
      border: '#F5C6C6',
      msg: 'Lamentablemente no podemos tomarte en este momento. Podés intentarlo nuevamente o contactarnos.',
    },
  };
  const cfg = statusConfig[data.status];

  const tabs = [
    { id: 'status' as const, label: 'Mi cita' },
    ...(hasTreatments
      ? [
          { id: 'profile' as const, label: 'Mi perfil' },
          { id: 'care' as const, label: 'Cuidados' },
        ]
      : []),
    ...(history.length > 0
      ? [{ id: 'facturas' as const, label: `Mis visitas (${history.length})` }]
      : []),
  ];

  const enablePhoneNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushMsg('Tu navegador no soporta notificaciones push.');
      return;
    }

    try {
      setPushLoading(true);
      setPushMsg('');

      const keyRes = await fetch('/api/notifications/vapid-public-key');
      const keyJson = await keyRes.json();
      if (!keyRes.ok) throw new Error(keyJson?.error || 'No se pudo iniciar push.');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushMsg('Permiso denegado. Activa notificaciones en tu navegador.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const vapidKey = urlBase64ToUint8Array(keyJson.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const subscribeRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: data.id, subscription }),
      });
      const subscribeJson = await subscribeRes.json();
      if (!subscribeRes.ok) throw new Error(subscribeJson?.error || 'No se pudo guardar la suscripcion.');

      setPushMsg('Notificaciones activadas. Te recordaremos 3 veces al dia (manana, tarde y noche).');
    } catch (error) {
      setPushMsg(error instanceof Error ? error.message : 'No se pudieron activar las notificaciones.');
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: PALETTE.bg }}>
      <div className="px-3 sm:px-4 py-5 sm:py-6 text-center border-b" style={{ background: '#fff', borderColor: PALETTE.cream }}>
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>
          Color Studio Gustavo
        </p>
        <h1 className="text-lg sm:text-xl font-light italic" style={{ color: PALETTE.dark, fontFamily: 'var(--font-playfair)' }}>
          Hola, {data.fullName.split(' ')[0]}
        </h1>
        <p className="text-[11px] uppercase tracking-[0.22em] mt-1" style={{ color: '#B18E69', fontFamily: 'var(--font-poppins)' }}>
          Espacio Privado De Seguimiento
        </p>
      </div>

      {tabs.length > 1 && (
        <div className="flex border-b sticky top-0 z-10 overflow-x-auto" style={{ background: '#fff', borderColor: PALETTE.cream }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 min-w-[120px] py-3.5 text-sm font-medium transition min-h-[48px]"
              style={{
                color: activeTab === t.id ? PALETTE.dark : PALETTE.soft,
                borderBottom: activeTab === t.id ? `2px solid ${PALETTE.dark}` : '2px solid transparent',
                fontFamily: 'var(--font-poppins)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-xl mx-auto px-3 sm:px-4 py-5 sm:py-6 space-y-5">
        {activeTab === 'status' && (
          <>
            <div
              className="relative rounded-3xl p-5 sm:p-7 shadow-lg overflow-hidden"
              style={{
                background: data.status === 'accepted'
                  ? 'linear-gradient(135deg, #213D2F 0%, #345C45 46%, #C4A882 100%)'
                  : cfg.bg,
                border: data.status === 'accepted' ? '1px solid #D8C2A3' : `1px solid ${cfg.border}`,
              }}
            >
              {data.status === 'accepted' && (
                <div
                  className="absolute -top-10 -right-8 w-36 h-36 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)' }}
                />
              )}
              <div className="relative z-10">
                <div className="text-center mb-3">
                  <span
                    className="inline-block text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.22em]"
                    style={{
                      color: data.status === 'accepted' ? '#FDF8F1' : cfg.color,
                      background: data.status === 'accepted' ? 'rgba(255,255,255,0.15)' : '#FFFFFFAA',
                      border: data.status === 'accepted' ? '1px solid rgba(255,255,255,0.28)' : `1px solid ${cfg.border}`,
                      fontFamily: 'var(--font-poppins)',
                    }}
                  >
                    Cliente premium · {cfg.badge}
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-light italic text-center mb-2"
                  style={{ color: data.status === 'accepted' ? '#FFF7EC' : cfg.color, fontFamily: 'var(--font-playfair)' }}
                >
                  {cfg.title}
                </h2>
                <p
                  className="text-sm text-center max-w-md mx-auto"
                  style={{
                    color: data.status === 'accepted' ? 'rgba(255,247,236,0.92)' : cfg.color,
                    fontFamily: 'var(--font-poppins)',
                    opacity: 0.92,
                    lineHeight: 1.55,
                  }}
                >
                  {cfg.msg}
                </p>
              </div>
            </div>

    {data.status === 'accepted' && data.availableSlots?.length > 0 && (
              (() => {
                // If already responded (from server or local)
                const accepted = slotDone ? confirmedSlot !== '' : data.slotAccepted;
                const rejected = slotDone ? confirmedSlot === '' : data.slotAccepted === false;
                const pending = !slotDone && data.slotAccepted === null;
                const slot = data.availableSlots[0];

                const handleConfirm = async (accept: boolean) => {
                  setSlotConfirming(true);
                  try {
                    await fetch(`/api/appointments/${data.id}/confirm-slot`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ accepted: accept, slot }),
                    });
                    setConfirmedSlot(accept ? slot : '');
                    setSlotDone(true);
                  } finally {
                    setSlotConfirming(false);
                  }
                };

                if (data.slotAccepted === true && !slotDone) {
                  return (
                    <div className="rounded-2xl p-6 text-center shadow-sm" style={{ background: '#EAF4ED', border: '1px solid #C8E6C9' }}>
                      <p className="text-3xl mb-2">✅</p>
                      <p className="text-sm font-medium" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>¡Turno confirmado!</p>
                      <p className="text-base mt-1 font-semibold" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>{data.confirmedSlot || slot}</p>
                      <p className="text-xs mt-2 opacity-60" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>Te esperamos. Cualquier consulta, contactanos.</p>
                    </div>
                  );
                }

                if (data.slotAccepted === false && !slotDone) {
                  return (
                    <div className="rounded-2xl p-6 text-center shadow-sm" style={{ background: '#FAE8E8', border: '1px solid #F5C6C6' }}>
                      <p className="text-3xl mb-2">❌</p>
                      <p className="text-sm font-medium" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)' }}>Indicaste que ese turno no te queda bien.</p>
                      <p className="text-xs mt-2" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)', opacity: 0.8 }}>Contactanos para encontrar otro horario.</p>
                    </div>
                  );
                }

                if (slotDone) {
                  return confirmedSlot ? (
                    <div className="rounded-2xl p-6 text-center shadow-sm" style={{ background: '#EAF4ED', border: '1px solid #C8E6C9' }}>
                      <p className="text-3xl mb-2">✅</p>
                      <p className="text-sm font-medium" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>¡Turno confirmado!</p>
                      <p className="text-base mt-1 font-semibold" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>{confirmedSlot}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-6 text-center shadow-sm" style={{ background: '#FAE8E8', border: '1px solid #F5C6C6' }}>
                      <p className="text-3xl mb-2">❌</p>
                      <p className="text-sm font-medium" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)' }}>Indicaste que ese turno no te queda bien.</p>
                      <p className="text-xs mt-2" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)', opacity: 0.8 }}>Contactanos para encontrar otro horario.</p>
                    </div>
                  );
                }

                // Pending — show big confirm/reject card
                return (
                  <div className="rounded-3xl overflow-hidden shadow-xl" style={{ border: `1px solid ${PALETTE.gold}` }}>
                    <div className="px-5 py-4 text-center" style={{ background: 'linear-gradient(135deg, #213D2F 0%, #345C45 100%)' }}>
                      <p className="text-[10px] uppercase tracking-widest text-white opacity-60 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Tu turno propuesto
                      </p>
                      <p className="text-xl sm:text-2xl font-light italic text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {slot}
                      </p>
                    </div>
                    <div className="px-5 py-5" style={{ background: '#fff' }}>
                      <p className="text-sm text-center mb-5" style={{ color: PALETTE.mid, fontFamily: 'var(--font-poppins)', lineHeight: 1.5 }}>
                        ¿Podés asistir en este horario?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConfirm(false)}
                          disabled={slotConfirming}
                          className="flex-1 py-3.5 rounded-2xl text-sm font-medium border disabled:opacity-40 min-h-[52px]"
                          style={{ borderColor: '#F5C6C6', color: '#A84444', background: '#FAE8E8', fontFamily: 'var(--font-poppins)' }}
                        >
                          {slotConfirming ? '...' : '✗ No puedo ese día'}
                        </button>
                        <button
                          onClick={() => handleConfirm(true)}
                          disabled={slotConfirming}
                          className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40 min-h-[52px]"
                          style={{ background: 'linear-gradient(135deg, #2E5E38, #4E8C5E)', fontFamily: 'var(--font-poppins)', boxShadow: '0 8px 18px rgba(46,94,56,0.3)' }}
                        >
                          {slotConfirming ? '...' : '✓ Confirmar turno'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            <div
              className="rounded-3xl p-4 sm:p-5 border"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(244,232,220,0.72) 100%)',
                borderColor: '#E7D5C4',
                boxShadow: '0 12px 30px rgba(122,92,82,0.08)',
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] mb-3" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                Ficha Privada De Tu Cita
              </p>
              <Row label="Nombre" value={data.fullName} />
              <Row label="Solicitado" value={new Date(data.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })} />
              <Row label="ID" value={data.id.slice(0, 8) + '...'} />
            </div>

            <p className="text-xs text-center" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)', letterSpacing: '0.03em' }}>
              Guardá esta página o tu ID para consultar el estado de tu cita.
            </p>

            {data.status === 'accepted' && (
              <div
                className="rounded-3xl p-4 sm:p-6 mobile-safe-sticky"
                style={{
                  background: 'linear-gradient(145deg, #FFFDFB 0%, #F5ECE2 62%, #F0E2D3 100%)',
                  border: '1px solid #EBDCCF',
                  boxShadow: '0 14px 34px rgba(122,92,82,0.10)',
                }}
              >
                <p className="text-[11px] uppercase tracking-[0.24em] mb-2" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                  Notificaciones Exclusivas
                </p>
                <h3 className="text-lg sm:text-xl font-light italic mb-2" style={{ color: '#5C3D35', fontFamily: 'var(--font-playfair)' }}>
                  Concierge de cuidado en tu telefono
                </h3>
                <p className="text-sm mb-4" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)', lineHeight: 1.55 }}>
                  Activá recordatorios premium para acompañarte durante tu resultado. Te enviamos avisos estratégicos a las 9:00, 14:00 y 20:00.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['09:00 · Rutina AM', '14:00 · Protección', '20:00 · Cuidado PM'].map((slot) => (
                    <span key={slot} className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: '#fff', color: '#6F5449', border: '1px solid #DECCB9', fontFamily: 'var(--font-poppins)' }}>
                      {slot}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={enablePhoneNotifications}
                  disabled={pushLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm text-white disabled:opacity-50 min-h-[48px]"
                  style={{
                    background: 'linear-gradient(135deg, #6D4F44 0%, #8C6759 45%, #C4A882 100%)',
                    fontFamily: 'var(--font-poppins)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: '0 10px 20px rgba(109,79,68,0.25)',
                  }}
                >
                  {pushLoading ? 'Activando...' : 'Activar experiencia premium'}
                </button>
                {pushMsg && (
                  <p className="text-xs mt-3" style={{ color: PALETTE.mid, fontFamily: 'var(--font-poppins)', lineHeight: 1.45 }}>
                    {pushMsg}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && hasTreatments && (
          <>
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${PALETTE.cream}` }}>
              <div className="px-5 py-4" style={{ background: PALETTE.dark }}>
                <p className="text-xs uppercase tracking-widest text-white opacity-70 mb-0.5">Tu historial capilar</p>
                <p className="text-white font-light italic" style={{ fontFamily: 'var(--font-playfair)' }}>{data.fullName}</p>
              </div>
              <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
                {[...data.treatmentsDone].reverse().map((tx, i) => {
                  const info = getTreatmentById(tx.treatmentId);
                  return (
                    <div key={tx.id} className="flex items-start gap-4 px-5 py-4">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#B79373' }} />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
                          {tx.treatmentName}
                          {i === 0 && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: PALETTE.cream, color: PALETTE.mid }}>
                              Último
                            </span>
                          )}
                        </p>
                        <p className="text-xs opacity-60 mt-0.5" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
                          {new Date(tx.performedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        {tx.notes && <p className="text-xs mt-1 italic" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>{tx.notes}</p>}
                        {info && <p className="text-xs mt-1.5 px-2 py-1 rounded-lg inline-block" style={{ background: PALETTE.bg, color: PALETTE.soft }}>Duración estimada: {info.durationEffect}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {latestInfo && (
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: `1px solid ${PALETTE.cream}` }}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: PALETTE.soft }}>Proxima visita sugerida</p>
                <p className="text-sm" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
                  Entre <strong>{latestInfo.nextVisitDays.min}</strong> y <strong>{latestInfo.nextVisitDays.max} días</strong> después de tu {latestTreatment?.treatmentName}.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'care' && latestInfo && latestTreatment && (
          <>
            <div className="rounded-2xl p-5 text-center" style={{ background: PALETTE.dark }}>
              <h2 className="text-lg font-light italic text-white mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Cuidados post {latestInfo.name}</h2>
              <p className="text-xs opacity-60 text-white" style={{ fontFamily: 'var(--font-poppins)' }}>{latestInfo.tagline}</p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${PALETTE.cream}` }}>
              <div className="px-5 py-3" style={{ background: PALETTE.dark }}>
                <p className="text-xs uppercase tracking-widest text-white opacity-80">Recordatorios de mantenimiento</p>
              </div>
              <div className="divide-y" style={{ background: '#fff', borderColor: PALETTE.cream }}>
                {latestInfo.reminders.map((r, i) => {
                  const dt = new Date(latestTreatment.performedAt);
                  dt.setDate(dt.getDate() + r.daysAfter);
                  const isPast = dt < new Date();
                  return (
                    <div key={i} className="flex items-start gap-4 px-5 py-4" style={{ opacity: isPast ? 0.5 : 1 }}>
                      <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#B79373' }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>{r.title}</p>
                          {isPast && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: PALETTE.cream, color: PALETTE.soft }}>Pasado</span>}
                        </div>
                        <p className="text-xs opacity-60 mt-0.5 mb-1" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
                          {dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })} · día {r.daysAfter}
                        </p>
                        <p className="text-xs" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>{r.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'facturas' && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${PALETTE.cream}` }}>
              <div className="px-5 py-4" style={{ background: PALETTE.dark }}>
                <p className="text-xs uppercase tracking-widest text-white opacity-70 mb-0.5">Tu historial de visitas</p>
                <p className="text-white font-light italic" style={{ fontFamily: 'var(--font-playfair)' }}>{data.fullName}</p>
              </div>
            </div>

            {history.map((entry) => {
              const serviceTotal = entry.accountingEntries.reduce((s, e) => s + Number(e.amount), 0);
              const productsTotal = entry.productsUsed.reduce((s, p) => s + p.salePrice * p.quantity, 0);
              const grandTotal = serviceTotal + productsTotal;
              const hasInvoice = grandTotal > 0 || entry.accountingEntries.length > 0;
              const visitDate = entry.confirmedSlot ||
                (entry.accountingEntries[0]?.performedAt
                  ? new Date(entry.accountingEntries[0].performedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : new Date(entry.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }));

              return (
                <div key={entry.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#fff', border: `1px solid ${PALETTE.cream}` }}>
                  {/* Header */}
                  <div className="px-5 py-4 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${PALETTE.cream}` }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>{entry.procedure}</p>
                      <p className="text-xs opacity-60 mt-0.5" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>{visitDate}</p>
                    </div>
                    {grandTotal > 0 && (
                      <p className="text-base font-medium whitespace-nowrap" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>
                        ${grandTotal.toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>

                  {/* Tratamientos */}
                  {entry.treatmentsDone.length > 0 && (
                    <div className="px-5 py-3" style={{ borderBottom: `1px solid ${PALETTE.cream}` }}>
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>Tratamientos</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.treatmentsDone.map((tx) => (
                          <span key={tx.id} className="text-xs px-2.5 py-1 rounded-full" style={{ background: PALETTE.cream, color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
                            {tx.treatmentName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Servicios cobrados */}
                  {entry.accountingEntries.length > 0 && (
                    <div className="px-5 py-3" style={{ borderBottom: entry.productsUsed.length > 0 ? `1px solid ${PALETTE.cream}` : undefined }}>
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>Servicios</p>
                      {entry.accountingEntries.map((e) => (
                        <div key={e.id} className="flex justify-between items-center py-0.5">
                          <p className="text-xs" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>{e.service}</p>
                          <p className="text-xs font-medium" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>${Number(e.amount).toLocaleString('es-AR')}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Productos */}
                  {entry.productsUsed.length > 0 && (
                    <div className="px-5 py-3">
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: PALETTE.soft, fontFamily: 'var(--font-poppins)' }}>Productos usados</p>
                      {entry.productsUsed.map((p) => (
                        <div key={p.id} className="flex justify-between items-center py-0.5">
                          <p className="text-xs" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>{p.productName} × {p.quantity}</p>
                          <p className="text-xs font-medium" style={{ color: '#2E5E38', fontFamily: 'var(--font-poppins)' }}>${(p.salePrice * p.quantity).toLocaleString('es-AR')}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link a factura */}
                  {hasInvoice && (
                    <div className="px-5 py-3" style={{ borderTop: `1px solid ${PALETTE.cream}`, background: PALETTE.bg }}>
                      <a
                        href={`/factura/${entry.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs uppercase tracking-widest underline"
                        style={{ color: PALETTE.mid, fontFamily: 'var(--font-poppins)' }}
                      >
                        Ver comprobante completo
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 text-center">
          <Link href="/" className="text-xs uppercase tracking-widest underline" style={{ color: PALETTE.soft }}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 py-1">
      <p className="text-xs uppercase tracking-wider" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)', minWidth: 90 }}>{label}</p>
      <p className="text-xs sm:text-right break-all" style={{ color: '#5C3D35', fontFamily: 'var(--font-poppins)' }}>{value}</p>
    </div>
  );
}
