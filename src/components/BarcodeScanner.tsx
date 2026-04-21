'use client';

import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => {
      detect: (source: HTMLVideoElement | ImageBitmap) => Promise<{ rawValue: string }[]>;
    };
  }
}

const PALETTE = {
  dark: '#5C3D35',
  mid: '#7A5C52',
  soft: '#9D7B6F',
  gold: '#C4A882',
  cream: '#F4E8DC',
};

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!window.BarcodeDetector) {
      setSupported(false);
      return;
    }
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scan();
      }
    } catch {
      setError('No se pudo acceder a la cámara. Verificá los permisos.');
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const scan = async () => {
    if (!videoRef.current || !window.BarcodeDetector) return;
    const detector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
    });

    const detect = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          stopCamera();
          onDetected(barcodes[0].rawValue);
          return;
        }
      } catch {
        // Ignore detection frame errors
      }
      rafRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  // Fallback: scan via captured image
  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.BarcodeDetector) return;
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      });
      const barcodes = await detector.detect(bitmap);
      if (barcodes.length > 0) {
        onDetected(barcodes[0].rawValue);
      } else {
        setError('No se encontró código de barras en la imagen.');
      }
    } catch {
      setError('Error al procesar la imagen.');
    }
  };

  if (!supported) {
    return (
      <div className="rounded-2xl p-5" style={{ background: '#FBF3E0', border: '1px solid #E8D5A0' }}>
        <p className="text-sm mb-3" style={{ color: PALETTE.dark, fontFamily: 'var(--font-poppins)' }}>
          Tu navegador no soporta escaneo de cámara. Tomá una foto del código de barras o ingresalo manualmente.
        </p>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
          className="text-sm w-full"
          style={{ color: PALETTE.mid }}
        />
        <button onClick={onClose} className="mt-3 text-xs underline" style={{ color: PALETTE.soft }}>Cancelar</button>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000' }}>
      {/* Video feed */}
      <video
        ref={videoRef}
        className="w-full"
        style={{ maxHeight: '260px', objectFit: 'cover' }}
        playsInline
        muted
      />

      {/* Overlay frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-48 h-32 border-2 rounded-lg"
          style={{ borderColor: PALETTE.gold, boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)' }}
        />
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(0,0,0,0.6)' }}>
        <span className="text-xs text-white opacity-80" style={{ fontFamily: 'var(--font-poppins)' }}>
          {scanning ? '🔍 Escaneando...' : 'Iniciando cámara...'}
        </span>
        <button onClick={() => { stopCamera(); onClose(); }}
          className="text-xs text-white opacity-70 hover:opacity-100 px-3 py-1 rounded-lg border border-white/30">
          Cancelar
        </button>
      </div>

      {error && (
        <div className="px-4 py-2" style={{ background: '#FAE8E8' }}>
          <p className="text-xs" style={{ color: '#A84444', fontFamily: 'var(--font-poppins)' }}>{error}</p>
        </div>
      )}

      {/* Fallback image capture */}
      <div className="px-4 py-2 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <label className="cursor-pointer text-xs text-white opacity-60 hover:opacity-100">
          📷 O tomá una foto
          <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
        </label>
      </div>
    </div>
  );
}
