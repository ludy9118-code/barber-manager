'use client';

import { motion } from 'framer-motion';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-3 sm:px-4 pt-14 sm:pt-20 pb-8 sm:pb-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #FBF6F0 0%, #F7EDE4 42%, #F0E4DA 100%)' }}
    >
      <motion.div
        className="absolute -top-24 -left-16 w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,168,130,0.32) 0%, transparent 72%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-20 w-60 h-60 sm:w-80 sm:h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(157,123,111,0.22) 0%, transparent 72%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <motion.div
        className="w-full max-w-5xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
          <motion.div variants={itemVariants} className="hidden md:block pl-2 lg:pl-4">
            <p
              className="text-[0.68rem] tracking-[0.42em] uppercase mb-5"
              style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}
            >
              Acceso Privado
            </p>
            <h2 className="text-5xl lg:text-6xl font-light italic mb-6 leading-[1.05]" style={{ fontFamily: 'var(--font-playfair)' }}>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #5C3D35, #9D7B6F 55%, #C4A882)' }}>
                Tu evolución capilar continúa
              </span>
            </h2>
            <p className="leading-relaxed text-base max-w-md" style={{ color: '#7E655C', fontFamily: 'var(--font-poppins)' }}>
              Este acceso es para clientas que ya viven la experiencia Color Studio y desean llevar un seguimiento profesional de su cabello.
            </p>

            <div className="mt-8 space-y-4">
              {['Control de procesos y servicios realizados', 'Seguimiento de color, salud y mantenimiento', 'Planificacion de tu proxima cita personalizada'].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4A882' }} />
                  <p className="text-sm tracking-[0.18em] uppercase" style={{ color: '#8A6F65', fontFamily: 'var(--font-poppins)' }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-[1.6rem] sm:rounded-[2rem] p-5 sm:p-8 md:p-9 border"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(251,246,240,0.86) 100%)',
              borderColor: 'rgba(196,168,130,0.46)',
              boxShadow: '0 20px 45px rgba(122,92,82,0.13)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h1
              className="text-2xl sm:text-3xl font-light italic mb-2 text-center"
              style={{ color: '#5C3D35', fontFamily: 'var(--font-playfair)' }}
            >
              Inicia sesión
            </h1>
            <p className="text-center text-xs sm:text-sm tracking-[0.12em] sm:tracking-[0.15em] uppercase mb-6 sm:mb-7" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
              Elegancia, color y cuidado profesional
            </p>
            <LoginForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
