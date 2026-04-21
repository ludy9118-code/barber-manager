'use client';

export default function ShareButton({ name }: { name: string }) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Factura — ${name}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('¡Enlace copiado! Podés enviárselo al cliente por WhatsApp o mensaje.');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 rounded-lg text-sm border font-medium"
      style={{ background: '#fff', border: '1px solid #C4A882', color: '#7A5C52', fontFamily: '"Inter", sans-serif', letterSpacing: '0.06em', fontSize: '11px', padding: '8px 20px', borderRadius: '1px', cursor: 'pointer' }}
    >
      COMPARTIR ENLACE
    </button>
  );
}
