import { getAppointmentById } from '@/lib/appointments';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShareButton from './ShareButton';
import PrintButton from './PrintButton';
import { prisma } from '@/lib/prisma';
import { asArray, isDbEnabled } from '@/lib/db-helpers';

async function getAppointmentForInvoice(id: string) {
  if (isDbEnabled()) {
    const row = await prisma.appointment.findUnique({ where: { id } });
    if (row) {
      return {
        ...row,
        hairHistory: asArray<string>(row.hairHistory),
        availableSlots: asArray<string>(row.availableSlots),
        treatmentsDone: asArray<{ id: string; treatmentId: string; treatmentName: string; performedAt: string; notes: string }>(row.treatmentsDone),
        accountingEntries: asArray<{ id: string; service: string; amount: number; performedBy: string; performedAt: string; notes: string }>(row.accountingEntries),
        productsUsed: asArray<{ id: string; productId: string; productName: string; brand: string; quantity: number; unit: string; costPrice: number; salePrice: number; usedAt: string; usedBy: string }>(row.productsUsed),
        pushSubscriptions: asArray(row.pushSubscriptions),
        notificationLog: asArray<string>(row.notificationLog),
        createdAt: row.createdAt.toISOString(),
      };
    }
  }

  return getAppointmentById(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = await getAppointmentForInvoice(id);
  return {
    title: a ? `Recibo — ${a.fullName} · Color Studio Gustavo` : 'Recibo',
  };
}

export default async function FacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAppointmentForInvoice(id);
  if (!a) notFound();

  const serviceTotal = (a.accountingEntries ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const productsTotal = (a.productsUsed ?? []).reduce((s, p) => s + p.salePrice * p.quantity, 0);
  const grandTotal = serviceTotal + productsTotal;

  const professional =
    (a.accountingEntries ?? [])[0]?.performedBy ||
    (a.productsUsed ?? [])[0]?.usedBy ||
    '—';

  const invoiceDate = (a.accountingEntries ?? []).length > 0
    ? a.accountingEntries[a.accountingEntries.length - 1].performedAt
    : a.notifiedAt || a.createdAt;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .invoice-root { background: #fff !important; padding: 0 !important; }
          .invoice-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div className="invoice-root min-h-screen py-8 px-3" style={{ background: '#F5F0EB', fontFamily: '"Inter", sans-serif' }}>

        {/* Action bar */}
        <div className="no-print max-w-[720px] mx-auto flex gap-2 mb-5 flex-wrap">
          <PrintButton />
          <ShareButton name={a.fullName} />
        </div>

        <div className="invoice-card max-w-[720px] mx-auto" style={{ background: '#fff', boxShadow: '0 2px 40px rgba(60,30,20,0.10)', borderRadius: '2px', overflow: 'hidden' }}>

          {/* ── TOP RULE ── */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #3B2820, #9D7B6F, #C4A882)' }} />

          {/* ── HEADER ── */}
          <div style={{ padding: '40px 48px 32px', borderBottom: '1px solid #EDE3D8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#9D7B6F', marginBottom: '8px', fontFamily: '"Inter", sans-serif' }}>
                Comprobante de servicios
              </p>
              <h1 style={{ fontSize: '32px', fontWeight: 300, fontStyle: 'italic', color: '#2C1810', lineHeight: 1.1, fontFamily: '"Cormorant Garamond", serif' }}>
                Color Studio<br /><em style={{ fontWeight: 600 }}>Gustavo</em>
              </h1>
              <p style={{ fontSize: '11px', color: '#9D7B6F', marginTop: '8px', fontFamily: '"Inter", sans-serif', letterSpacing: '0.03em' }}>
                Especialistas en color y tratamientos capilares
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C4A882', marginBottom: '6px', fontFamily: '"Inter", sans-serif' }}>Fecha</p>
              <p style={{ fontSize: '14px', color: '#3B2820', fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, letterSpacing: '0.02em' }}>
                {new Date(invoiceDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p style={{ fontSize: '10px', color: '#C4A882', marginTop: '10px', fontFamily: '"Inter", sans-serif', letterSpacing: '0.08em' }}>
                N.° {a.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* ── CLIENT + PROFESSIONAL ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #EDE3D8' }}>
            <div style={{ padding: '24px 48px', borderRight: '1px solid #EDE3D8' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9D7B6F', marginBottom: '10px', fontFamily: '"Inter", sans-serif' }}>
                Cliente
              </p>
              <p style={{ fontSize: '20px', fontWeight: 400, color: '#2C1810', fontFamily: '"Cormorant Garamond", serif', marginBottom: '4px' }}>
                {a.fullName}
              </p>
              {a.clientPhone && (
                <p style={{ fontSize: '12px', color: '#9D7B6F', fontFamily: '"Inter", sans-serif', marginBottom: '4px' }}>{a.clientPhone}</p>
              )}
              <p style={{ fontSize: '11px', color: '#C4A882', fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em' }}>
                {a.procedure}
              </p>
            </div>
            <div style={{ padding: '24px 32px 24px 32px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9D7B6F', marginBottom: '10px', fontFamily: '"Inter", sans-serif' }}>
                Profesional a cargo
              </p>
              <p style={{ fontSize: '20px', fontWeight: 400, color: '#2C1810', fontFamily: '"Cormorant Garamond", serif', marginBottom: '4px' }}>
                {professional}
              </p>
              {a.confirmedSlot && (
                <p style={{ fontSize: '11px', color: '#4E7A59', fontFamily: '"Inter", sans-serif', marginTop: '4px' }}>
                  {a.confirmedSlot}
                </p>
              )}
            </div>
          </div>

          {/* ── TREATMENT HISTORY ── */}
          {(a.treatmentsDone ?? []).length > 0 && (
            <div style={{ padding: '20px 48px', borderBottom: '1px solid #EDE3D8', background: '#FDFAF7' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9D7B6F', marginBottom: '10px', fontFamily: '"Inter", sans-serif' }}>
                Historial de tratamientos
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {a.treatmentsDone.map((tx) => (
                  <span key={tx.id} style={{ fontSize: '11px', padding: '3px 12px', border: '1px solid #EDE3D8', color: '#7A5C52', fontFamily: '"Inter", sans-serif', letterSpacing: '0.01em', background: '#fff' }}>
                    {tx.treatmentName} · {new Date(tx.performedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── SERVICES / LABOR ── */}
          {(a.accountingEntries ?? []).length > 0 && (
            <div style={{ padding: '28px 48px', borderBottom: '1px solid #EDE3D8' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9D7B6F', marginBottom: '16px', fontFamily: '"Inter", sans-serif' }}>
                Servicios y mano de obra
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #EDE3D8' }}>
                    {['Descripción', 'Profesional', 'Fecha', 'Importe'].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 3 ? 'right' : 'left', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8A090', paddingBottom: '8px', fontWeight: 400, fontFamily: '"Inter", sans-serif' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {a.accountingEntries.map((e, idx) => (
                    <tr key={e.id} style={{ borderBottom: idx < a.accountingEntries.length - 1 ? '1px solid #F5F0EB' : 'none' }}>
                      <td style={{ padding: '10px 0', fontFamily: '"Inter", sans-serif' }}>
                        <span style={{ fontSize: '13px', color: '#2C1810' }}>{e.service}</span>
                        {e.notes && <span style={{ display: 'block', fontSize: '11px', color: '#9D7B6F', marginTop: '2px' }}>{e.notes}</span>}
                      </td>
                      <td style={{ padding: '10px 0', fontSize: '12px', color: '#7A5C52', fontFamily: '"Inter", sans-serif' }}>{e.performedBy}</td>
                      <td style={{ padding: '10px 0', fontSize: '12px', color: '#9D7B6F', fontFamily: '"Inter", sans-serif' }}>
                        {new Date(e.performedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: 500, color: '#2C1810', textAlign: 'right', fontFamily: '"Cormorant Garamond", serif' }}>
                        ${Number(e.amount).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', paddingTop: '12px', borderTop: '1px solid #EDE3D8', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9D7B6F', fontFamily: '"Inter", sans-serif' }}>Subtotal servicios </span>
                <span style={{ fontSize: '15px', color: '#2C1810', fontFamily: '"Cormorant Garamond", serif', marginLeft: '12px' }}>${serviceTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>
          )}

          {/* ── PRODUCTS USED ── */}
          {(a.productsUsed ?? []).length > 0 && (
            <div style={{ padding: '28px 48px', borderBottom: '1px solid #EDE3D8', background: '#FDFAF7' }}>
              <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9D7B6F', marginBottom: '16px', fontFamily: '"Inter", sans-serif' }}>
                Insumos y productos utilizados
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #EDE3D8' }}>
                    {['Producto', 'Cant.', 'P. unitario', 'Subtotal'].map((h, i) => (
                      <th key={h} style={{ textAlign: i >= 2 ? 'right' : i === 1 ? 'center' : 'left', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8A090', paddingBottom: '8px', fontWeight: 400, fontFamily: '"Inter", sans-serif' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {a.productsUsed.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: idx < a.productsUsed.length - 1 ? '1px solid #F5F0EB' : 'none' }}>
                      <td style={{ padding: '10px 0', fontFamily: '"Inter", sans-serif' }}>
                        <span style={{ fontSize: '13px', color: '#2C1810' }}>{p.productName}</span>
                        {p.brand && <span style={{ display: 'block', fontSize: '11px', color: '#9D7B6F', marginTop: '2px' }}>{p.brand}</span>}
                      </td>
                      <td style={{ padding: '10px 0', fontSize: '12px', color: '#7A5C52', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                        {p.quantity} {p.unit}
                      </td>
                      <td style={{ padding: '10px 0', fontSize: '12px', color: '#9D7B6F', textAlign: 'right', fontFamily: '"Inter", sans-serif' }}>
                        ${p.salePrice.toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding: '10px 0', fontSize: '14px', color: '#2C1810', textAlign: 'right', fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 }}>
                        ${(p.salePrice * p.quantity).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', paddingTop: '12px', borderTop: '1px solid #EDE3D8', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9D7B6F', fontFamily: '"Inter", sans-serif' }}>Subtotal insumos </span>
                <span style={{ fontSize: '15px', color: '#2C1810', fontFamily: '"Cormorant Garamond", serif', marginLeft: '12px' }}>${productsTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>
          )}

          {/* ── TOTAL ── */}
          <div style={{ padding: '28px 48px', background: '#2C1810' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,243,228,0.45)', fontFamily: '"Inter", sans-serif', marginBottom: '8px' }}>
                  Total a abonar
                </p>
                <p style={{ fontSize: '42px', fontWeight: 300, fontStyle: 'italic', color: '#FFF3E4', fontFamily: '"Cormorant Garamond", serif', lineHeight: 1 }}>
                  ${grandTotal.toLocaleString('es-AR')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {serviceTotal > 0 && productsTotal > 0 && (
                  <>
                    <p style={{ fontSize: '11px', color: 'rgba(255,243,228,0.45)', fontFamily: '"Inter", sans-serif', marginBottom: '4px' }}>
                      Servicios: ${serviceTotal.toLocaleString('es-AR')}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,243,228,0.45)', fontFamily: '"Inter", sans-serif' }}>
                      Insumos: ${productsTotal.toLocaleString('es-AR')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ padding: '16px 48px', background: '#F5F0EB', borderTop: '1px solid #EDE3D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '11px', color: '#9D7B6F', fontFamily: '"Inter", sans-serif', letterSpacing: '0.03em' }}>
              Gracias por tu confianza · Color Studio Gustavo
            </p>
            <p style={{ fontSize: '10px', color: '#C4A882', fontFamily: '"Inter", sans-serif', letterSpacing: '0.08em' }}>
              {a.id}
            </p>
          </div>

          {/* ── BOTTOM RULE ── */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #C4A882, #9D7B6F, #3B2820)' }} />

        </div>
      </div>
    </>
  );
}
