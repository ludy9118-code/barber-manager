'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FBF6F0 0%, #F7EDE4 40%, #F0E4DA 100%)' }}>
      <motion.div
        className="w-full max-w-xl rounded-2xl p-8 text-center"
        style={{ background: '#fff', border: '1px solid #F4E8DC', boxShadow: '0 20px 45px rgba(122,92,82,0.13)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-light italic mb-3" style={{ color: '#5C3D35', fontFamily: 'var(--font-playfair)' }}>
          Registro de clientas
        </h1>
        <p className="text-sm mb-5" style={{ color: '#7A5C52', fontFamily: 'var(--font-poppins)' }}>
          Tu acceso se crea unicamente al agendar tu cita de valoracion.
        </p>
        <Link
          href="/appointment"
          className="inline-block px-6 py-3 rounded-lg text-white text-xs uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg, #7A5C52, #C4A882)', fontFamily: 'var(--font-poppins)' }}
        >
          Ir a agendar cita
        </Link>
      </motion.div>
    </div>
  );
}
