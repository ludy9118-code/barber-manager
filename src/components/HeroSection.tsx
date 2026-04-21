'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.25, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' as const } },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 1.2, ease: 'easeOut' as const } },
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FBF6F0 0%, #F4E8DC 50%, #EDD9C8 100%)' }}
    >
      {/* Círculos decorativos de fondo */}
      <motion.div
        className="absolute top-20 right-0 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C4A882 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 left-0 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9D7B6F 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        className="text-center max-w-4xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow label */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div variants={lineVariants} className="h-px w-16 origin-left" style={{ background: '#C4A882' }} />
          <span
            className="text-xs tracking-[0.4em] uppercase"
            style={{ color: '#9D7B6F', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
          >
            Salón de Belleza Premium
          </span>
          <motion.div variants={lineVariants} className="h-px w-16 origin-right" style={{ background: '#C4A882' }} />
        </motion.div>

        {/* Título principal */}
        <motion.h1
          variants={itemVariants}
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-medium mb-3 leading-none tracking-tight"
        >
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #5C3D35 0%, #9D7B6F 50%, #C4A882 100%)' }}
          >
            Color Studio
          </span>
        </motion.h1>

        {/* Nombre */}
        <motion.h2
          variants={itemVariants}
          style={{ fontFamily: "'Playfair Display', serif", color: '#B89880' }}
          className="text-lg sm:text-2xl md:text-3xl font-light tracking-[0.2em] sm:tracking-[0.25em] mb-6 sm:mb-10 uppercase"
        >
          Gustavo Gómez
        </motion.h2>

        {/* Divisor decorativo */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-6 sm:mb-10">
          <div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, #C4A882)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9D7B6F' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: '#C4A882' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9D7B6F' }} />
          <div className="h-px w-24" style={{ background: 'linear-gradient(to left, transparent, #C4A882)' }} />
        </motion.div>

        {/* Frase principal */}
        <motion.p
          variants={itemVariants}
          style={{ fontFamily: "'Playfair Display', serif", color: '#6B4E44' }}
          className="text-xl sm:text-2xl md:text-3xl font-light italic leading-relaxed mb-4 sm:mb-5 max-w-2xl mx-auto"
        >
          Un espacio donde el color
          <br />
          <span style={{ color: '#9D7B6F' }}>se transforma en arte</span>
        </motion.p>

        {/* Frases secundarias */}
        <motion.p
          variants={itemVariants}
          style={{ fontFamily: "'Poppins', sans-serif", color: '#A08C84' }}
          className="text-sm sm:text-base font-light tracking-wide leading-relaxed mb-2 sm:mb-3 max-w-xl mx-auto"
        >
          Cada detalle está pensado para realzar tu esencia
        </motion.p>

        <motion.p
          variants={itemVariants}
          style={{ fontFamily: "'Poppins', sans-serif", color: '#A08C84' }}
          className="text-sm sm:text-base font-light tracking-wide leading-relaxed mb-10 sm:mb-14 max-w-xl mx-auto"
        >
          Será un placer acompañarte en tu próximo cambio de imagen
        </motion.p>

        {/* Botones */}
        <motion.div variants={itemVariants} className="flex gap-5 justify-center flex-wrap items-center">

          {/* Botón Agendar Cita — Premium */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-1 rounded-full blur-sm"
              style={{ background: 'linear-gradient(135deg, #C4A882, #9D7B6F, #C4A882)' }}
              animate={{ opacity: [0.35, 0.65, 0.35] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Link href="/appointment">
              <button
                style={{ fontFamily: "'Poppins', sans-serif" }}
                className="relative px-8 sm:px-12 py-3.5 sm:py-4 text-xs sm:text-sm font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white rounded-full overflow-hidden"
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)' }}
                />
                <motion.div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-0 left-0 w-10 h-full skew-x-12"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                    animate={{ x: ['-120%', '320%'] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                  />
                </motion.div>
                <span className="relative z-10 flex items-center gap-3">
                  Agendar Cita
                </span>
              </button>
            </Link>
          </motion.div>

          {/* Separador vertical */}
          <div className="w-px h-8 hidden sm:block" style={{ background: '#C4A882', opacity: 0.4 }} />

          {/* Botón Conocer más */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <button
              style={{ fontFamily: "'Poppins', sans-serif", color: '#7A5C52' }}
              className="group relative px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-light tracking-[0.18em] sm:tracking-[0.2em] uppercase overflow-hidden rounded-full"
            >
              <motion.div
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: '#C4A882' }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative z-10 flex items-center gap-3">
                Conocer más
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ color: '#9D7B6F' }}
                >
                  →
                </motion.span>
              </span>
            </button>
          </motion.div>

        </motion.div>

        {/* Servicios destacados */}
        <motion.div
          variants={itemVariants}
          className="mt-10 sm:mt-16 flex items-center justify-center gap-4 sm:gap-6 flex-wrap"
        >
          {['Colorimetría', 'Tratamientos', 'Asesoría Personalizada'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: '#C4A882' }} />
              <span
                style={{ fontFamily: "'Poppins', sans-serif", color: '#B89880', fontSize: '0.7rem' }}
                className="tracking-[0.2em] uppercase"
              >
                {item}
              </span>
            </div>
          ))}
        </motion.div>

      </motion.div>
    </section>
  );
}
