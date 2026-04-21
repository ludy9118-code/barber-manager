'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-b from-white/98 to-white/95 backdrop-blur-xl shadow-md z-50 border-b border-gray-100">
      <motion.nav
        className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Link href="/" className="flex items-center gap-2 sm:gap-4 group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <defs>
                  <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{stopColor:'#B8956E', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#8B6F47', stopOpacity:1}} />
                  </radialGradient>
                </defs>
                
                <circle cx="100" cy="100" r="98" fill="url(#bgGradient)" stroke="#A68A6F" strokeWidth="1.5"/>
                <circle cx="100" cy="100" r="85" fill="none" stroke="#D4C5B9" strokeWidth="1" opacity="0.6"/>
                
                <line x1="60" y1="45" x2="140" y2="45" stroke="#E8D5C4" strokeWidth="0.8" opacity="0.8"/>
                
                <text x="100" y="82" style={{fontFamily: "'Playfair Display', serif", fontWeight: 500, letterSpacing: '4px'}} fontSize="32" textAnchor="middle" fill="#F5EFE7">
                  COLOR
                </text>
                
                <text x="100" y="110" style={{fontFamily: "'Playfair Display', serif", fontWeight: 500, letterSpacing: '4px'}} fontSize="28" textAnchor="middle" fill="#F5EFE7">
                  STUDIO
                </text>
                
                <circle cx="95" cy="125" r="1.5" fill="#E8D5C4"/>
                <circle cx="100" cy="125" r="1.5" fill="#E8D5C4"/>
                <circle cx="105" cy="125" r="1.5" fill="#E8D5C4"/>
                
                <text x="100" y="148" style={{fontFamily: "'Poppins', sans-serif", fontWeight: 300, letterSpacing: '2px'}} fontSize="10" textAnchor="middle" fill="#D4C5B9">
                  G U S T A V O
                </text>
                
                <line x1="60" y1="155" x2="140" y2="155" stroke="#E8D5C4" strokeWidth="0.8" opacity="0.8"/>
              </svg>
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <h1 style={{fontFamily: "'Playfair Display', serif"}} className="text-2xl font-medium tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900">
                Color Studio
              </h1>
              <p style={{fontFamily: "'Poppins', sans-serif"}} className="text-xs font-light tracking-widest text-amber-700 -mt-1.5">
                GUSTAVO GÓMEZ
              </p>
            </div>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex gap-2 sm:gap-3 md:gap-4 items-center">
          {/* Botón Ingresar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/auth/login">
              <button
                style={{fontFamily: "'Poppins', sans-serif"}}
                className="group relative px-4 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base font-light tracking-widest text-amber-900 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-amber-300 rounded-lg"
                  initial={{ opacity: 0.3 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center">
                  <motion.span
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0.7 }}
                    transition={{ duration: 0.3 }}
                  >
                    Ingresar
                  </motion.span>
                </span>
              </button>
            </Link>
          </motion.div>

          {/* Botón Agendar Cita - con animación llamativa */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            {/* Halo pulsante exterior */}
            <motion.div
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-400 via-pink-400 to-amber-400 opacity-60 blur-sm"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '200% 200%' }}
            />

            <Link href="/appointment">
              <button
                style={{fontFamily: "'Poppins', sans-serif"}}
                className="group relative px-4 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base font-light tracking-widest text-amber-900 overflow-hidden rounded-lg"
              >
                {/* Fondo base blanco */}
                <div className="absolute inset-0 bg-white rounded-lg" />

                {/* Fondo animado al hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-100 to-pink-50 rounded-lg"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Borde dorado que se destaca */}
                <motion.div
                  className="absolute inset-0 border-2 border-amber-400 rounded-lg"
                  animate={{ borderColor: ['#fbbf24', '#f9a8d4', '#fbbf24'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Destello de luz que cruza */}
                <motion.div
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{ pointerEvents: 'none' }}
                >
                  <motion.div
                    className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 skew-x-12"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
                  />
                </motion.div>

                {/* Texto */}
                <span className="relative z-10 flex items-center justify-center">
                  Agendar Cita
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.nav>
    </header>
  );
}
