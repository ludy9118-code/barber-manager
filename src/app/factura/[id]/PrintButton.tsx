'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg text-sm text-white font-medium"
      style={{ background: '#2C1810', fontFamily: '"Inter", sans-serif', letterSpacing: '0.06em', fontSize: '11px', padding: '8px 20px', borderRadius: '1px', color: '#FFF3E4', border: 'none', cursor: 'pointer' }}
    >
      IMPRIMIR / PDF
    </button>
  );
}
