'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error en el acceso.');

      window.location.href = `/appointment/status/${json.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el acceso. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.72rem] tracking-[0.24em] uppercase mb-2"
            style={{ color: '#8A6F65', fontFamily: 'var(--font-poppins)' }}
          >
            Número de teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none transition"
            style={{
              borderColor: 'rgba(196,168,130,0.75)',
              background: 'rgba(255,255,255,0.78)',
              color: '#5C3D35',
              fontFamily: 'var(--font-poppins)',
            }}
            placeholder="+57 300 123 4567"
          />
          <p className="mt-2 text-xs" style={{ color: '#A08C84', fontFamily: 'var(--font-poppins)' }}>
            Ingresa el mismo número que registraste al agendar tu cita.
          </p>
        </motion.div>

        {error && (
          <motion.p variants={itemVariants} className="text-sm" style={{ color: '#A45151', fontFamily: 'var(--font-poppins)' }}>
            {error}
          </motion.p>
        )}

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-white rounded-xl transition disabled:opacity-50 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)',
            fontFamily: 'var(--font-poppins)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontSize: '0.74rem',
            fontWeight: 500,
            boxShadow: '0 12px 22px rgba(122,92,82,0.24)',
          }}
        >
          <motion.span
            className="absolute top-0 left-0 w-10 h-full skew-x-12"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
            animate={{ x: ['-140%', '420%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
          {loading ? 'Ingresando...' : 'Ingresar'}
        </motion.button>

        <motion.p variants={itemVariants} className="text-center text-sm" style={{ color: '#7E655C', fontFamily: 'var(--font-poppins)' }}>
          El acceso se habilita cuando tu cita de valoración es aceptada.
        </motion.p>
      </form>
    </motion.div>
  );
}
